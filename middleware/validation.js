import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('name').isString().withMessage('Name must be a string'),
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('number').isString().withMessage('Number must be a string'),
  body('dob').isISO8601().toDate().withMessage('DOB must be a valid date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
