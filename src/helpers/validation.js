const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");

exports.loginValidation = [
     body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
        .isEmail().withMessage("Email must be a valid email address."),
    body("password").isLength({ min: 10 }).trim().withMessage("Password must be specified."),
    sanitizeBody("email").escape(),
    sanitizeBody("password").escape(),
]