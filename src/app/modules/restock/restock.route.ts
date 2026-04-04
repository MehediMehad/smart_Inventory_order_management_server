import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RestockControllers } from "./restock.controller";
import { RestockValidations } from "./restock.validation";

const router = Router();

router.get(
    "/",
    auth('ADMIN'),
    RestockControllers.getAllFromQueue
);

router.post(
    "/",
    auth('ADMIN'),
    validateRequest(RestockValidations.restockProductSchema),
    RestockControllers.restockProduct
);

router.delete(
    "/:id",
    auth('ADMIN'),
    RestockControllers.deleteFromQueue
);

export const RestockRoutes = router;