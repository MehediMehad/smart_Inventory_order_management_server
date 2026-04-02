export default ({ pascal, camel }) => `import { Router } from "express";
import { ${pascal}Controllers } from "./${camel}.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../middlewares/s3MulterMiddleware";
import validateRequest from "../../middlewares/validateRequest";
import { ${pascal}Validations } from "./${camel}.validation";

const router = Router();

router.post(
  "/create-${camel}",
  auth('LAWYER', 'FIRM'),
  fileUploader.uploadFields,
  validateRequest(${pascal}Validations.create${pascal}Schema, {
    image: 'single',
  }),
  ${pascal}Controllers.create${pascal}IntoDB,
);

export const ${pascal}Routes = router;`;
