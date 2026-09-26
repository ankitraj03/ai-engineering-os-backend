import { Request, Response, NextFunction } from 'express';
import {
  GitOrganizationsService,
  gitOrganizationsService,
} from '../services/git-organization.service';

export class GitOrganizationsController {
  constructor(
    private readonly service: GitOrganizationsService = gitOrganizationsService
  ) {}

  createGitOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const integrationId = req.params.id as string;
      const gitOrg = await this.service.createGitOrganization(
        integrationId,
        req.body
      );
      res.status(201).json(gitOrg);
    } catch (err) {
      next(err);
    }
  };

  getIntegrationGitOrganizations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const integrationId = req.params.id as string;
      const gitOrgs = await this.service.getIntegrationGitOrganizations(
        integrationId
      );
      res.status(200).json(gitOrgs);
    } catch (err) {
      next(err);
    }
  };

  getGitOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const gitOrg = await this.service.getGitOrganization(id);
      res.status(200).json(gitOrg);
    } catch (err) {
      next(err);
    }
  };

  updateGitOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const updated = await this.service.updateGitOrganization(
        id,
        req.body
      );
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  deleteGitOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.service.deleteGitOrganization(id);
      res.status(200).json({
        success: true,
        message: `Git organization "${id}" has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const gitOrganizationsController = new GitOrganizationsController();
