import { Request, Response, NextFunction } from 'express';
import {
  IntelligenceService,
  intelligenceService,
} from '../services/intelligence.service';

export class IntelligenceController {
  constructor(
    private readonly service: IntelligenceService = intelligenceService
  ) {}

  getDashboardKPIs = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const kpis = await this.service.getDashboardKPIs();
      res.status(200).json(kpis);
    } catch (err) {
      next(err);
    }
  };

  getProjects = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const projects = await this.service.getProjects();
      res.status(200).json(projects);
    } catch (err) {
      next(err);
    }
  };

  getProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const project = await this.service.getProjectById(id);
      res.status(200).json(project);
    } catch (err) {
      next(err);
    }
  };

  getDeveloperWorkloads = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const workloads = await this.service.getDeveloperWorkloads();
      res.status(200).json(workloads);
    } catch (err) {
      next(err);
    }
  };
}

export const intelligenceController = new IntelligenceController();
