import { Request, Response, NextFunction } from 'express';
import { UsersService, usersService } from '../services/user.service';
import { UnauthorizedError } from '../utils/app-error';

export class UsersController {
  constructor(private readonly service: UsersService = usersService) {}

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }
      const profile = await this.service.getProfile(req.user.id);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }
      const updated = await this.service.updateProfile(req.user.id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const user = await this.service.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };
}

export const usersController = new UsersController();
