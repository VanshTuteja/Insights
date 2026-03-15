import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return next();
};

export const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['jobseeker', 'employer'])
    .withMessage('Role must be either jobseeker or employer'),
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid phone number'),
  body('location')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Location is required'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateProfileUpdate = [
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional({ checkFalsy: true })
    .isIn(['jobseeker', 'employer', 'admin'])
    .withMessage('Invalid role'),
  body('website')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid URL'),
  body('bio')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10 })
    .withMessage('Phone number must be at least 10 digits'),
  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Location is required'),
  body('jobTitle')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Job title is required'),
  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Company name is required'),
  body('companySize')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1 })
    .withMessage('Company size is required'),
  body('industry')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Industry is required'),
  body('experience')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Experience is required'),
  body('education')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Education is required'),
  body('skills')
    .optional({ checkFalsy: true })
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  handleValidationErrors
];

export const validateJobCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Job title is required and cannot exceed 200 characters'),
  body('company')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name is required and cannot exceed 100 characters'),
  body('description')
    .isLength({ min: 50 })
    .withMessage('Job description must be at least 50 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('salary')
    .trim()
    .notEmpty()
    .withMessage('Salary range is required'),
  body('type')
    .isIn(['full-time', 'part-time', 'contract', 'remote', 'hybrid'])
    .withMessage('Invalid job type'),
  handleValidationErrors
];
