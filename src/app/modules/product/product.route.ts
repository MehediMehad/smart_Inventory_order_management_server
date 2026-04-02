import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ProductControllers } from "./product.controller";
import { ProductValidations } from "./product.validation";

const router = Router();

router.get(
    "/",
    ProductControllers.getAllProducts
);

router.get(
    "/:id",
    ProductControllers.getSingleProduct
);

router.post(
    "/",
    auth('ADMIN', 'USER'),
    validateRequest(ProductValidations.createProductSchema),
    ProductControllers.createProductIntoDB
);

router.patch(
    "/:id",
    auth('ADMIN'),
    validateRequest(ProductValidations.updateProductSchema),
    ProductControllers.updateProduct
);

router.delete(
    "/:id",
    auth('ADMIN'),
    ProductControllers.deleteProduct
);

export const ProductRoutes = router;