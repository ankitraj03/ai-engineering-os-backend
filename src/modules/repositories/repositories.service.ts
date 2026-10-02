import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { Repository } from './entities/repository.entity';
import { CreateRepositoryDto } from './dto/create-repository.dto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { GoogleGenAI } from '@google/genai';

const execAsync = promisify(exec);

@Injectable()
export class RepositoriesService {
  constructor(
    @InjectRepository(Repository)
    private readonly repositoryRepo: TypeOrmRepository<Repository>,
  ) {}

  async create(createDto: CreateRepositoryDto): Promise<Repository> {
    const newRepo = this.repositoryRepo.create(createDto);
    return this.repositoryRepo.save(newRepo);
  }

  async findAll(): Promise<Repository[]> {
    return this.repositoryRepo.find();
  }

  async findOne(id: string): Promise<any> {
    const repo = await this.repositoryRepo.findOne({ where: { id } });
    if (!repo) {
      throw new Error('Repository not found');
    }
    
    // Fetch live GitHub stats if applicable
    let githubStats = { openPrs: 0, openIssues: 0, language: 'Unknown' };
    if (repo.url.includes('github.com')) {
      try {
        const repoPath = repo.url.split('github.com/')[1].replace(/\.git$/, '');
        const response = await fetch(`https://api.github.com/repos/${repoPath}`);
        if (response.ok) {
          const data = await response.json();
          githubStats = {
            openPrs: 0, // Github API counts PRs as issues, a separate PR call is needed for exact PRs
            openIssues: data.open_issues_count || 0,
            language: data.language || 'Unknown'
          };
          
          // Fetch exact PR count
          const prsResponse = await fetch(`https://api.github.com/repos/${repoPath}/pulls?state=open&per_page=1`);
          if (prsResponse.ok) {
            // using link headers to get total PRs is hard without a library, but we can just parse the array if it's small, or use search API.
            // For simplicity, we just fetch the first page and count if it's < 30, or say "30+"
            const prs = await prsResponse.json();
            githubStats.openPrs = prs.length;
            githubStats.openIssues = Math.max(0, githubStats.openIssues - githubStats.openPrs); // GitHub includes PRs in open_issues_count
          }
        }
      } catch (e) {
        console.error('Failed to fetch github stats', e);
      }
    }

    return { ...repo, ...githubStats };
  }

  async analyze(id: string): Promise<any> {
    const repo = await this.repositoryRepo.findOne({ where: { id } });
    if (!repo) {
      throw new Error('Repository not found');
    }

    // 1. Get branches using git ls-remote
    let branches: string[] = [];
    try {
      const { stdout } = await execAsync(`git ls-remote --heads ${repo.url}`);
      branches = stdout.split('\n').filter(line => line).map(line => line.split('refs/heads/')[1]);
    } catch (e) {
      console.error('Failed to fetch branches', e);
      branches = ['main']; // fallback
    }

    // 2. Fetch README (naive approach assuming github)
    let readme = '';
    try {
      const rawUrl = repo.url.replace('github.com', 'raw.githubusercontent.com').replace(/\.git$/, '') + '/main/README.md';
      const response = await fetch(rawUrl);
      if (response.ok) {
        readme = await response.text();
      }
    } catch (e) {
      console.error('Failed to fetch readme', e);
    }

    // 3. Explain with Gemini
    let aiExplanation = 'No explanation available.';
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze this repository based on its name (${repo.name}) and its README. 
      Provide a concise 3-paragraph summary of its purpose, architecture, and what it does.
      README:
      ${readme.substring(0, 5000)}
      `;
      
      let aiResponse;
      let retries = 3;
      while (retries > 0) {
        try {
          aiResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt
          });
          break; // success, exit loop
        } catch (err: any) {
          if (err?.status === 503 && retries > 1) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds before retry
          } else {
            throw err;
          }
        }
      }
      aiExplanation = aiResponse.text;
    } catch (e) {
      console.error('Failed to call Gemini', e);
      aiExplanation = 'The AI model is currently experiencing high demand. Please try inspecting the repository again in a few moments.';
    }

    return {
      branches,
      aiExplanation
    };
  }

  async chat(id: string, message: string): Promise<any> {
    const repo = await this.repositoryRepo.findOne({ where: { id } });
    if (!repo) throw new Error('Repository not found');

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an AI assisting with a repository named ${repo.name} (URL: ${repo.url}).
    User says: "${message}"
    Please provide a concise, helpful response regarding the codebase architecture, best practices, or specific technologies likely used in this repo.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });
      return { reply: response.text };
    } catch (err) {
      console.error('Chat error', err);
      return { reply: 'Sorry, I am currently experiencing high demand. Please try again.' };
    }
  }

  async getIssues(id: string): Promise<any[]> {
    const repo = await this.repositoryRepo.findOne({ where: { id } });
    if (!repo || !repo.url.includes('github.com')) return [];

    try {
      const repoPath = repo.url.split('github.com/')[1].replace(/\.git$/, '');
      const response = await fetch(`https://api.github.com/repos/${repoPath}/issues?state=open&per_page=10`);
      if (!response.ok) return [];
      const data = await response.json();
      // Filter out PRs, as GitHub API returns PRs as issues too
      return data.filter((issue: any) => !issue.pull_request).map((issue: any) => ({
        id: issue.number.toString(),
        title: issue.title,
        priority: issue.labels?.length ? issue.labels[0].name : 'Medium',
        url: issue.html_url
      }));
    } catch (e) {
      return [];
    }
  }

  async getPullRequests(id: string): Promise<any[]> {
    const repo = await this.repositoryRepo.findOne({ where: { id } });
    if (!repo || !repo.url.includes('github.com')) return [];

    try {
      const repoPath = repo.url.split('github.com/')[1].replace(/\.git$/, '');
      const response = await fetch(`https://api.github.com/repos/${repoPath}/pulls?state=open&per_page=10`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((pr: any) => ({
        id: pr.number.toString(),
        title: pr.title,
        author: pr.user?.login || 'Unknown',
        url: pr.html_url
      }));
    } catch (e) {
      return [];
    }
  }
}
