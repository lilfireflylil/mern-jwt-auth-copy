import { Router } from "express";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleRefresh,
} from "../controllers/auth.controller.js";

export const authRoutes = Router();
authRoutes.post("/register", handleRegister);
authRoutes.post("/login", handleLogin);
authRoutes.get("/refresh", handleRefresh);
authRoutes.get("/logout", handleLogout);
