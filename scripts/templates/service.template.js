export default ({ pascal, camel }) => `import prisma from '../../libs/prisma';
import type { TCreate${pascal}Payload } from './${camel}.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

const create${pascal} = async (payload: TCreate${pascal}Payload) => {
  // TODO: implement create logic here
  // const result = await prisma.${camel}.create({ data: payload });
  // return result;
};

export const ${pascal}Services = {
  create${pascal},
};`;
