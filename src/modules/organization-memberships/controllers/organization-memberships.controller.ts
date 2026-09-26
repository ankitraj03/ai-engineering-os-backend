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
import { OrganizationMembershipsService } from '../services/organization-memberships.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { OrgRoleGuard } from '../../../common/guards/org-role.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { MembershipRole } from '../../../common/types/enums';
import { AddMemberDto } from '../dto/add-member.dto';
import { UpdateMemberRoleDto } from '../dto/update-member-role.dto';
import { UpdateMemberStatusDto } from '../dto/update-member-status.dto';
import { MembershipResponseDto } from '../dto/membership-response.dto';

@Controller('organizations/:id/members')
@UseGuards(AuthGuard, OrgRoleGuard)
export class OrganizationMembershipsController {
  constructor(
    private readonly membershipsService: OrganizationMembershipsService
  ) {}

  @Post()
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async addMember(
    @Param('id', new ParseUUIDPipe()) organizationId: string,
    @Body() dto: AddMemberDto
  ): Promise<MembershipResponseDto> {
    const membership = await this.membershipsService.addMember(
      organizationId,
      dto
    );
    return MembershipResponseDto.fromEntity(membership);
  }

  @Get()
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER)
  async listMembers(
    @Param('id', new ParseUUIDPipe()) organizationId: string
  ): Promise<MembershipResponseDto[]> {
    const members = await this.membershipsService.listMembers(organizationId);
    return members.map(MembershipResponseDto.fromEntity);
  }

  @Get(':memberId')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER)
  async getMembership(
    @Param('id', new ParseUUIDPipe()) organizationId: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string
  ): Promise<MembershipResponseDto> {
    const membership = await this.membershipsService.getMembership(
      organizationId,
      memberId
    );
    return MembershipResponseDto.fromEntity(membership);
  }

  @Patch(':memberId/role')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async updateRole(
    @Param('id', new ParseUUIDPipe()) organizationId: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
    @Body() dto: UpdateMemberRoleDto
  ): Promise<MembershipResponseDto> {
    const updated = await this.membershipsService.updateRole(
      organizationId,
      memberId,
      dto.role
    );
    return MembershipResponseDto.fromEntity(updated);
  }

  @Patch(':memberId/status')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) organizationId: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
    @Body() dto: UpdateMemberStatusDto
  ): Promise<MembershipResponseDto> {
    const updated = await this.membershipsService.updateStatus(
      organizationId,
      memberId,
      dto.status
    );
    return MembershipResponseDto.fromEntity(updated);
  }

  @Delete(':memberId')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async removeMember(
    @Param('id', new ParseUUIDPipe()) organizationId: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string
  ): Promise<{ success: boolean; message: string }> {
    await this.membershipsService.removeMember(organizationId, memberId);
    return {
      success: true,
      message: `Member "${memberId}" removed from organization "${organizationId}"`,
    };
  }
}
