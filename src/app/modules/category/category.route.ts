import { Router } from "express";
import { CategoryControllers } from "./category.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidations } from "./category.validation";

const router = Router();


router.post(
    "/",
    auth('ADMIN'),
    validateRequest(CategoryValidations.createCategorySchema),
    CategoryControllers.createCategory
);

router.get(
    "/",
    CategoryControllers.getAllCategories
);

router.get(
    "/:id",
    CategoryControllers.getSingleCategory
);

router.patch(
    "/:id",
    auth('ADMIN'),
    validateRequest(CategoryValidations.updateCategorySchema),
    CategoryControllers.updateCategory
);

router.delete(
    "/:id",
    auth('ADMIN'),
    CategoryControllers.deleteCategory
);

export const CategoryRoutes = router;