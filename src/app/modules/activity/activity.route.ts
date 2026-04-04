import { Router } from "express";
import auth from "../../middlewares/auth";
import { ActivityLogControllers } from "./activity.controller";

const router = Router();

router.get(
    "/",
    auth('ADMIN',),
    ActivityLogControllers.getAllActivityLogs
);

export const ActivityLogRoutes = router;