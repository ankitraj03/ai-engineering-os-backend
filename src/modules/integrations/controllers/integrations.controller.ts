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
import { IntegrationsService } from '../services/integrations.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { OrgRoleGuard } from '../../../common/guards/org-role.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { MembershipRole } from '../../../common/types/enums';
import { CreateIntegrationDto } from '../dto/create-integration.dto';
import { UpdateIntegrationDto } from '../dto/update-integration.dto';
import { IntegrationResponseDto } from '../dto/integration-response.dto';

@Controller()
@UseGuards(AuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('organizations/:id/integrations')
  @UseGuards(OrgRoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async createIntegration(
    @Param('id', new ParseUUIDPipe()) organizationId: string,
    @Body() dto: CreateIntegrationDto
  ): Promise<IntegrationResponseDto> {
    const integration = await this.integrationsService.createIntegration(
      organizationId,
      dto
    );
    return IntegrationResponseDto.fromEntity(integration);
  }

  @Get('organizations/:id/integrations')
  @UseGuards(OrgRoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER)
  async listByOrganization(
    @Param('id', new ParseUUIDPipe()) organizationId: string
  ): Promise<IntegrationResponseDto[]> {
    const integrations =
      await this.integrationsService.listByOrganization(organizationId);
    return integrations.map(IntegrationResponseDto.fromEntity);
  }

  @Get('integrations/:id')
  async getIntegration(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<IntegrationResponseDto> {
    const integration = await this.integrationsService.getIntegration(id);
    return IntegrationResponseDto.fromEntity(integration);
  }

  @Patch('integrations/:id')
  async updateIntegration(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateIntegrationDto
  ): Promise<IntegrationResponseDto> {
    const updated = await this.integrationsService.updateIntegration(id, dto);
    return IntegrationResponseDto.fromEntity(updated);
  }

  @Delete('integrations/:id')
  async deleteIntegration(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<{ success: boolean; message: string }> {
    await this.integrationsService.deleteIntegration(id);
    return {
      success: true,
      message: `Integration "${id}" has been deleted`,
    };
  }
}
