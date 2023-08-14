import { NextFunction, Request, Response } from 'express';
import { checkSchema } from 'express-validator';
import usersService from '~/services/users.services';
import { validate } from '~/utils/validation';

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password ' });
  }
  next();
};

const registerSchema = checkSchema({
  name: {
    notEmpty: true,
    isString: true,
    trim: true,
    isLength: {
      options: {
        min: 1,
        max: 100
      }
    }
  },
  email: {
    notEmpty: true,
    trim: true,
    isEmail: true,
    custom: {
      options: async (value) => {
        const isExisted = await usersService.checkEmailExist(value);
        if (isExisted) {
          throw new Error('Email already exists');
        }
        return true;
      }
    }
  },
  password: {
    notEmpty: true,
    isStrongPassword: {
      options: {
        minLength: 6
      }
    }
  },
  confirm_password: {
    notEmpty: true,
    isStrongPassword: {
      options: {
        minLength: 6
      }
    },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }
    }
  },
  date_of_birth: {
    isISO8601: {
      options: {
        strict: true,
        strictSeparator: true
      }
    }
  }
});

export const registerValidator = validate(registerSchema);
