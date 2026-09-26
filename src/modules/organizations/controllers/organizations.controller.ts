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
import { OrganizationsService } from '../services/organizations.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { OrgRoleGuard } from '../../../common/guards/org-role.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthUser } from '../../../common/types/auth-user.interface';
import { MembershipRole } from '../../../common/types/enums';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationResponseDto } from '../dto/organization-response.dto';

@Controller('organizations')
@UseGuards(AuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async createOrganization(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateOrganizationDto
  ): Promise<OrganizationResponseDto> {
    const result = await this.organizationsService.createOrganization(
      user.id,
      dto
    );
    return OrganizationResponseDto.fromEntity(
      result.organization,
      MembershipRole.OWNER
    );
  }

  @Get()
  async getUserOrganizations(
    @CurrentUser() user: AuthUser
  ): Promise<OrganizationResponseDto[]> {
    const orgs = await this.organizationsService.getUserOrganizations(user.id);
    return orgs.map((org) => OrganizationResponseDto.fromEntity(org, org.role));
  }

  @Get(':id')
  @UseGuards(OrgRoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER)
  async getOrganization(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<OrganizationResponseDto> {
    const org = await this.organizationsService.getOrganization(id);
    return OrganizationResponseDto.fromEntity(org);
  }

  @Patch(':id')
  @UseGuards(OrgRoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async updateOrganization(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationDto
  ): Promise<OrganizationResponseDto> {
    const updated = await this.organizationsService.updateOrganization(id, dto);
    return OrganizationResponseDto.fromEntity(updated);
  }

  @Delete(':id')
  @UseGuards(OrgRoleGuard)
  @Roles(MembershipRole.OWNER)
  async deleteOrganization(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<{ success: boolean; message: string }> {
    await this.organizationsService.deleteOrganization(id);
    return {
      success: true,
      message: `Organization "${id}" has been deleted`,
    };
  }
}
