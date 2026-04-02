import httpStatus from 'http-status';

import ApiError from '../errors/ApiError';

const toPrismaDate = (date: string | Date): Date => {
  if (date instanceof Date) {
    if (isNaN(date.getTime())) throw new Error('Invalid Date object');
    return date;
  }

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid date format: ${date}. Expected ISO-8601 string or Date object.`,
    );
  }

  return parsed;
};

/** 
 example 01:
const prismaDate = toPrismaDate('2002-09-15');
//* Output: 2002-09-15T00:00:00.000Z

example 02:
const prismaDate = toPrismaDate(new Date('2002-09-15'));
//* Output: 2002-09-15T00:00:00.000Z
**/

const matchDay = (dayOne: string = new Date().toISOString(), dayTwo: string) => {
  const dayOneSplit = dayOne.split('T')[0];
  const dayTwoSplit = dayTwo.split('T')[0];
  return dayOneSplit === dayTwoSplit;
};

export const dateHelpers = {
  toPrismaDate,
  matchDay,
};
