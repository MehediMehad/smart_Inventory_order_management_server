import { Router } from "express";
import auth from "../../middlewares/auth";
import { DashboardControllers } from "./dashboard.controller";
import { UserRoleEnum } from "@prisma/client";

const router = Router();

router.get(
    "/stats",
    auth("ADMIN"),
    DashboardControllers.getDashboardStats
);

export const DashboardRoutes = router;