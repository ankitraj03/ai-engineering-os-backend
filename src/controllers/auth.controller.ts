import { Request, Response, NextFunction } from 'express';
import { AuthService, authService } from '../services/auth.service';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ statusCode: 401, message: 'Not authenticated' });
        return;
      }
      const result = await this.service.getMe(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
