const { body } = require("express-validator");

const signupValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters."),
  body("email").trim().isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/\d/)
    .withMessage("Password must contain at least one number.")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain at least one letter."),
  body("phone")
    .optional({ checkFalsy: true })
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number."),
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

module.exports = { signupValidation, loginValidation };
