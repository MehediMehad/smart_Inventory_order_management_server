// Validate Mongo ObjectId (24 hex chars)
export const isValidMongoObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
