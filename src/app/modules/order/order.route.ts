import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { OrderControllers } from "./order.controller";
import { OrderValidations } from "./order.validation";

const router = Router();

router.post(
    "/",
    auth('USER', 'ADMIN'),
    validateRequest(OrderValidations.createOrderSchema),
    OrderControllers.createOrderIntoDB
);

router.get(
    "/",
    auth('ADMIN'),
    OrderControllers.getAllOrders
);

router.get(
    "/:id",
    auth('ADMIN'),
    OrderControllers.getSingleOrder
);

router.patch(
    "/update-status/:id",
    auth('ADMIN'),
    validateRequest(OrderValidations.updateStatusSchema),
    OrderControllers.updateStatus
);

router.post(
    "/cancel/:id",
    auth('USER', 'ADMIN'),
    OrderControllers.cancelOrder
);

export const OrderRoutes = router;