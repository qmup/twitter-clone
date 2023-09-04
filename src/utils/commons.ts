import { ParamSchema } from 'express-validator';

export type RequestSchema<T> = {
  [K in keyof T]?: ParamSchema;
};

export const numberEnumToArray = (
  numberEnum: Record<string, string | number>
) => Object.values(numberEnum).filter((v) => typeof v === 'number') as number[];
