import { Request, Response, NextFunction } from 'express';
import {
  OrganizationsService,
  organizationsService,
} from '../services/organization.service';
import { UnauthorizedError } from '../utils/app-error';
import { MembershipRole } from '../models/enums';

export class OrganizationsController {
  constructor(
    private readonly service: OrganizationsService = organizationsService
  ) {}

  createOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const result = await this.service.createOrganization(
        req.user.id,
        req.body
      );

      res.status(201).json({
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
        logo_url: result.organization.logo_url,
        role: MembershipRole.OWNER,
        created_at: result.organization.created_at,
        updated_at: result.organization.updated_at,
      });
    } catch (err) {
      next(err);
    }
  };

  getUserOrganizations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const orgs = await this.service.getUserOrganizations(req.user.id);
      res.status(200).json(orgs);
    } catch (err) {
      next(err);
    }
  };

  getOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const org = await this.service.getOrganization(id);
      res.status(200).json(org);
    } catch (err) {
      next(err);
    }
  };

  updateOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const updated = await this.service.updateOrganization(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  deleteOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.service.deleteOrganization(id);
      res.status(200).json({
        success: true,
        message: `Organization "${id}" has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const organizationsController = new OrganizationsController();
