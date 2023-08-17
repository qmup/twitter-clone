import express from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';
import HTTP_STATUS from '~/constants/httpStatus';
import { EntityError, ErrorWithStatus } from '~/models/Errors';
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (
  validation: RunnableValidationChains<ValidationChain>
) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    await validation.run(req);

    const errors = validationResult(req);
    // no error -> next
    if (errors.isEmpty()) {
      return next();
    }

    const errorsObject = errors.mapped();
    const entityErrors = new EntityError({ errors: {} });

    for (const key in errorsObject) {
      const { msg } = errorsObject[key];
      if (
        msg instanceof ErrorWithStatus &&
        msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY
      ) {
        return next(msg);
      }
      entityErrors.errors[key] = errorsObject[key];
    }
    next(entityErrors);
  };
};
