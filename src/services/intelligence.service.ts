export interface DashboardKPIs {
  velocity: number;
  riskIndex: number;
  activeIncidents: number;
  aiReliabilityScore: number;
  openPullRequests: number;
  pipelineHealthPercent: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  key: string;
  description: string;
  health: 'healthy' | 'warning' | 'critical';
  repositoryCount: number;
  activeIncidentsCount: number;
}

export class IntelligenceService {
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    return {
      velocity: 87,
      riskIndex: 14,
      activeIncidents: 1,
      aiReliabilityScore: 98.4,
      openPullRequests: 12,
      pipelineHealthPercent: 99.2,
    };
  }

  async getProjects(): Promise<ProjectSummary[]> {
    return [
      {
        id: "agentic-workflow-engine",
        name: "Agentic Workflow Engine",
        key: "AWE",
        description: "Autonomous multi-agent execution orchestrator and distributed tool runtime.",
        health: "healthy",
        repositoryCount: 3,
        activeIncidentsCount: 0,
      },
      {
        id: "llm-guardrail-proxy",
        name: "LLM Guardrail Proxy",
        key: "LGP",
        description: "Zero-latency token inspection, prompt injection firewall, and enterprise egress audit proxy.",
        health: "warning",
        repositoryCount: 2,
        activeIncidentsCount: 1,
      },
      {
        id: "vector-fabric-rag",
        name: "Vector Fabric RAG",
        key: "VFR",
        description: "Hybrid dense/sparse semantic retrieval pipeline and contextual embeddings cache.",
        health: "healthy",
        repositoryCount: 4,
        activeIncidentsCount: 0,
      },
    ];
  }

  async getProjectById(id: string): Promise<ProjectSummary | null> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id) || projects[0];
  }

  async getDeveloperWorkloads() {
    return [
      {
        id: "dev-1",
        name: "Elena Rostova",
        role: "Staff AI Architect",
        activeTasks: 3,
        prReviewLoad: 5,
        blockedTasks: 0,
        workloadPercent: 78,
      },
      {
        id: "dev-2",
        name: "Devon Bailey",
        role: "Principal Infrastructure Lead",
        activeTasks: 4,
        prReviewLoad: 2,
        blockedTasks: 1,
        workloadPercent: 88,
      },
      {
        id: "dev-3",
        name: "Marcus Vance",
        role: "Senior Distributed Systems",
        activeTasks: 2,
        prReviewLoad: 4,
        blockedTasks: 0,
        workloadPercent: 62,
      },
    ];
  }
}

export const intelligenceService = new IntelligenceService();
