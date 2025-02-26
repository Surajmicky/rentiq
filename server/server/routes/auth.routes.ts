import { Router } from "express";
import passport from "passport";
import { authController } from "../controllers/auth.controller";

const router = Router();

router.post("/register", authController.register);
router.post("/login", passport.authenticate("local"), authController.login);
router.post("/logout", authController.logout);
router.get("/user", authController.getUser);

export const authRoutes = router;
