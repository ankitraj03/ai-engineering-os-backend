import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationMembershipsRepository } from '../repositories/organization-memberships.repository';
import { OrganizationMembership } from '../entities/organization-membership.entity';
import { AddMemberDto } from '../dto/add-member.dto';
import { MembershipRole, MembershipStatus } from '../../../common/types/enums';

@Injectable()
export class OrganizationMembershipsService {
  constructor(
    private readonly membershipsRepository: OrganizationMembershipsRepository
  ) {}

  async addMember(
    organizationId: string,
    dto: AddMemberDto
  ): Promise<OrganizationMembership> {
    const existing =
      await this.membershipsRepository.findByUserAndOrganization(
        dto.user_id,
        organizationId
      );

    if (existing) {
      throw new ConflictException(
        `User "${dto.user_id}" is already a member of organization "${organizationId}"`
      );
    }

    return this.membershipsRepository.create({
      organization_id: organizationId,
      user_id: dto.user_id,
      role: dto.role,
      status: dto.status,
    });
  }

  async listMembers(
    organizationId: string
  ): Promise<OrganizationMembership[]> {
    return this.membershipsRepository.findByOrganization(organizationId);
  }

  async getMembership(
    organizationId: string,
    memberId: string
  ): Promise<OrganizationMembership> {
    const membership = await this.membershipsRepository.findById(memberId);
    if (!membership || membership.organization_id !== organizationId) {
      throw new NotFoundException(
        `Membership "${memberId}" not found in organization "${organizationId}"`
      );
    }
    return membership;
  }

  async updateRole(
    organizationId: string,
    memberId: string,
    role: MembershipRole
  ): Promise<OrganizationMembership> {
    const membership = await this.getMembership(organizationId, memberId);

    // If demoting an OWNER, ensure there is at least one other active OWNER
    if (membership.role === MembershipRole.OWNER && role !== MembershipRole.OWNER) {
      const ownerCount = await this.membershipsRepository.countOwners(
        organizationId
      );
      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot demote the only OWNER of this organization. Promote another member to OWNER first.'
        );
      }
    }

    return this.membershipsRepository.updateRole(memberId, role);
  }

  async updateStatus(
    organizationId: string,
    memberId: string,
    status: MembershipStatus
  ): Promise<OrganizationMembership> {
    const membership = await this.getMembership(organizationId, memberId);

    // If suspending an OWNER, ensure there is at least one other active OWNER
    if (
      membership.role === MembershipRole.OWNER &&
      status !== MembershipStatus.ACTIVE
    ) {
      const ownerCount = await this.membershipsRepository.countOwners(
        organizationId
      );
      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot suspend the only active OWNER of this organization.'
        );
      }
    }

    return this.membershipsRepository.updateStatus(memberId, status);
  }

  async removeMember(
    organizationId: string,
    memberId: string
  ): Promise<boolean> {
    const membership = await this.getMembership(organizationId, memberId);

    if (membership.role === MembershipRole.OWNER) {
      const ownerCount = await this.membershipsRepository.countOwners(
        organizationId
      );
      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the only OWNER of this organization.'
        );
      }
    }

    return this.membershipsRepository.delete(memberId);
  }
}
