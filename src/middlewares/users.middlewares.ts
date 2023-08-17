import { checkSchema } from 'express-validator';
import HTTP_STATUS from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';
import usersService from '~/services/users.services';
import { validate } from '~/utils/validation';

const loginSchema = checkSchema({
  email: {
    trim: true,
    isEmail: true,
    custom: {
      options: async (value, { req }) => {
        const user = await usersService.checkUser({
          email: value,
          password: req.body.password
        });
        if (!user) {
          throw new Error('User not found');
        }
        req.user = user;
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
  }
});

const registerSchema = checkSchema({
  name: {
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
        const user = await usersService.checkEmailExist(value);
        if (user) {
          throw new ErrorWithStatus({
            message: 'Email already exists',
            status: HTTP_STATUS.UNAUTHORIZED
          });
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

export const loginValidator = validate(loginSchema);
export const registerValidator = validate(registerSchema);
