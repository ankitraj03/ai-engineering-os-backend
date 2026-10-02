import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RepositoriesService } from './repositories.service';
import { CreateRepositoryDto } from './dto/create-repository.dto';

@Controller('repositories')
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Post()
  async create(@Body() createRepoDto: CreateRepositoryDto) {
    return this.repositoriesService.create(createRepoDto);
  }

  @Get()
  async findAll() {
    return this.repositoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.repositoriesService.findOne(id);
  }

  @Get(':id/analyze')
  async analyze(@Param('id') id: string) {
    return this.repositoriesService.analyze(id);
  }

  @Post(':id/chat')
  async chat(@Param('id') id: string, @Body('message') message: string) {
    return this.repositoriesService.chat(id, message);
  }

  @Get(':id/issues')
  async getIssues(@Param('id') id: string) {
    return this.repositoriesService.getIssues(id);
  }

  @Get(':id/pull-requests')
  async getPullRequests(@Param('id') id: string) {
    return this.repositoriesService.getPullRequests(id);
  }
}
