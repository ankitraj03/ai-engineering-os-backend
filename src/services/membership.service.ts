import {
  OrganizationMembershipsRepository,
  organizationMembershipsRepository,
} from '../repositories/membership.repository';
import { OrganizationMembership } from '../models/membership.model';
import { MembershipRole, MembershipStatus } from '../models/enums';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/app-error';

export class OrganizationMembershipsService {
  constructor(
    private readonly repo: OrganizationMembershipsRepository = organizationMembershipsRepository
  ) {}

  async addMember(
    organizationId: string,
    data: { user_id: string; role?: MembershipRole }
  ): Promise<OrganizationMembership> {
    const existing = await this.repo.findByUserAndOrganization(
      data.user_id,
      organizationId
    );

    if (existing) {
      throw new ConflictError(
        'User is already a member of this organization'
      );
    }

    return this.repo.create({
      organization_id: organizationId,
      user_id: data.user_id,
      role: data.role || MembershipRole.MEMBER,
      status: MembershipStatus.ACTIVE,
    });
  }

  async getMembers(
    organizationId: string
  ): Promise<OrganizationMembership[]> {
    return this.repo.findByOrganization(organizationId);
  }

  async getMember(
    organizationId: string,
    memberId: string
  ): Promise<OrganizationMembership> {
    const member = await this.repo.findById(memberId);
    if (!member || member.organization_id !== organizationId) {
      throw new NotFoundError(
        `Member with ID "${memberId}" not found in this organization`
      );
    }
    return member;
  }

  async updateMemberRole(
    organizationId: string,
    memberId: string,
    newRole: MembershipRole
  ): Promise<OrganizationMembership> {
    const member = await this.getMember(organizationId, memberId);

    // Guard: Do not allow demoting the last remaining OWNER
    if (member.role === MembershipRole.OWNER && newRole !== MembershipRole.OWNER) {
      const ownerCount = await this.repo.countOwners(organizationId);
      if (ownerCount <= 1) {
        throw new BadRequestError(
          'Cannot change the role of the last remaining OWNER of the organization'
        );
      }
    }

    return this.repo.updateRole(memberId, newRole);
  }

  async updateMemberStatus(
    organizationId: string,
    memberId: string,
    newStatus: MembershipStatus
  ): Promise<OrganizationMembership> {
    const member = await this.getMember(organizationId, memberId);

    // Guard: Do not suspend the last remaining OWNER
    if (
      member.role === MembershipRole.OWNER &&
      newStatus !== MembershipStatus.ACTIVE
    ) {
      const ownerCount = await this.repo.countOwners(organizationId);
      if (ownerCount <= 1) {
        throw new BadRequestError(
          'Cannot deactivate or suspend the last remaining OWNER of the organization'
        );
      }
    }

    return this.repo.updateStatus(memberId, newStatus);
  }

  async removeMember(
    organizationId: string,
    memberId: string
  ): Promise<boolean> {
    const member = await this.getMember(organizationId, memberId);

    // Guard: Do not allow removing the last remaining OWNER
    if (member.role === MembershipRole.OWNER) {
      const ownerCount = await this.repo.countOwners(organizationId);
      if (ownerCount <= 1) {
        throw new BadRequestError(
          'Cannot remove the last remaining OWNER of the organization'
        );
      }
    }

    return this.repo.delete(memberId);
  }
}

export const organizationMembershipsService = new OrganizationMembershipsService();
