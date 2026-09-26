import { Request, Response, NextFunction } from 'express';
import {
  IntegrationsService,
  integrationsService,
} from '../services/integration.service';

export class IntegrationsController {
  constructor(
    private readonly service: IntegrationsService = integrationsService
  ) {}

  createIntegration = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const orgId = req.params.id as string;
      const integration = await this.service.createIntegration(orgId, req.body);
      res.status(201).json(integration);
    } catch (err) {
      next(err);
    }
  };

  getOrganizationIntegrations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const orgId = req.params.id as string;
      const integrations = await this.service.getOrganizationIntegrations(orgId);
      res.status(200).json(integrations);
    } catch (err) {
      next(err);
    }
  };

  getIntegration = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const integration = await this.service.getIntegration(id);
      res.status(200).json(integration);
    } catch (err) {
      next(err);
    }
  };

  updateIntegrationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const updated = await this.service.updateIntegrationStatus(
        id,
        req.body.status
      );
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  deleteIntegration = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.service.deleteIntegration(id);
      res.status(200).json({
        success: true,
        message: `Integration "${id}" has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const integrationsController = new IntegrationsController();
