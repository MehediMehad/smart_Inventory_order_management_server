export default ({ pascal, camel }) => `import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import { ${pascal}Services } from './${camel}.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';

const create${pascal}IntoDB = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const result = await ${pascal}Services.create${pascal}(body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: '${pascal} created successfully',
    data: result,
  });
});

export const ${pascal}Controllers = {
  create${pascal}IntoDB,
};`;
