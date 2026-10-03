import { Request, Response, NextFunction } from 'express';
import {
  OrganizationMembershipsService,
  organizationMembershipsService,
} from '../services/membership.service';

export class OrganizationMembershipsController {
  constructor(
    private readonly service: OrganizationMembershipsService = organizationMembershipsService
  ) {}

  addMember = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const orgId = req.params.id as string;
      const membership = await this.service.addMember(orgId, req.body);
      res.status(201).json(membership);
    } catch (err) {
      next(err);
    }
  };

  getMembers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const orgId = req.params.id as string;
      const members = await this.service.getMembers(orgId);
      res.status(200).json(members);
    } catch (err) {
      next(err);
    }
  };

  getMember = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const orgId = req.params.id as string;
      const memberId = req.params.memberId as string;
      const member = await this.service.getMember(orgId, memberId);
      res.status(200).json(member);
    } catch (err) {
      next(err);
    }
  };

  updateMemberRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const orgId = req.params.id as string;
      const memberId = req.params.memberId as string;
      const updated = await this.service.updateMemberRole(
        orgId,
        memberId,
        req.body.role
      );
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  updateMemberStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const orgId = req.params.id as string;
      const memberId = req.params.memberId as string;
      const updated = await this.service.updateMemberStatus(
        orgId,
        memberId,
        req.body.status
      );
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  removeMember = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const orgId = req.params.id as string;
      const memberId = req.params.memberId as string;
      await this.service.removeMember(orgId, memberId);
      res.status(200).json({
        success: true,
        message: `Member "${memberId}" removed from organization`,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const organizationMembershipsController = new OrganizationMembershipsController();
