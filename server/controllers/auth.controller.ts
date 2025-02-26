import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { authService } from "../services/auth.service";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const existingUser = await authService.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await authService.createUser(req.body);
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  }

  login(req: Request, res: Response) {
    res.status(200).json(req.user);
  }

  logout(req: Request, res: Response, next: NextFunction) {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  }

  getUser(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  }
}

export const authController = new AuthController();
