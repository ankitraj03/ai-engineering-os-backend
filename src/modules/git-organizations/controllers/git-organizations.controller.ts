import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GitOrganizationsService } from '../services/git-organizations.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CreateGitOrganizationDto } from '../dto/create-git-organization.dto';
import { UpdateGitOrganizationDto } from '../dto/update-git-organization.dto';
import { GitOrganizationResponseDto } from '../dto/git-organization-response.dto';

@Controller()
@UseGuards(AuthGuard)
export class GitOrganizationsController {
  constructor(
    private readonly gitOrgsService: GitOrganizationsService
  ) {}

  @Post('integrations/:id/git-organizations')
  async createGitOrganization(
    @Param('id', new ParseUUIDPipe()) integrationId: string,
    @Body() dto: CreateGitOrganizationDto
  ): Promise<GitOrganizationResponseDto> {
    const gitOrg = await this.gitOrgsService.createGitOrganization(
      integrationId,
      dto
    );
    return GitOrganizationResponseDto.fromEntity(gitOrg);
  }

  @Get('integrations/:id/git-organizations')
  async listByIntegration(
    @Param('id', new ParseUUIDPipe()) integrationId: string
  ): Promise<GitOrganizationResponseDto[]> {
    const gitOrgs =
      await this.gitOrgsService.listGitOrganizations(integrationId);
    return gitOrgs.map(GitOrganizationResponseDto.fromEntity);
  }

  @Get('git-organizations/:id')
  async getGitOrganization(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<GitOrganizationResponseDto> {
    const gitOrg = await this.gitOrgsService.getGitOrganization(id);
    return GitOrganizationResponseDto.fromEntity(gitOrg);
  }

  @Patch('git-organizations/:id')
  async updateGitOrganization(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateGitOrganizationDto
  ): Promise<GitOrganizationResponseDto> {
    const updated = await this.gitOrgsService.updateGitOrganization(id, dto);
    return GitOrganizationResponseDto.fromEntity(updated);
  }

  @Delete('git-organizations/:id')
  async deleteGitOrganization(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<{ success: boolean; message: string }> {
    await this.gitOrgsService.deleteGitOrganization(id);
    return {
      success: true,
      message: `Git organization "${id}" has been deleted`,
    };
  }
}
