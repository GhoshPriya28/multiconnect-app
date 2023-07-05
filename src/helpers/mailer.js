const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();
let transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  ignoreTLS: true,
  secure: true,
  auth: {
    user: process.env.EMAIL_SMTP_USERNAME,
    pass: process.env.EMAIL_SMTP_PASSWORD
  }
});
exports.send = function (from, to, subject, html) {
  return transporter.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};
