"use strict";
const bcrypt = require("bcryptjs");
const db = require("../models");
const { AdminModel: AdminModel, AppCredsModel: AppCredsModel } = db;
const Op = db.Sequelize.Op;
const { body, validationResult } = require('express-validator');
var session = require('express-session');
const apiResponse = require("../helpers/apiResponse");

// For View 
const loginView = (req, res) => {
    res.render("admin/pages/index", {});
}
//login API
const login = [
    async (req, res) => {
        const { email, password } = req.body;
        const admin = await AdminModel.findOne({ where: { email } }).then(result => {
            if (result) {
                const password_valid = bcrypt.compare(password, result.password).then(isMatch => {
                    if (isMatch) {
                        req.session.userId = result.id;
                        req.session.email = result.email;
                        req.session.loggedIn = true
                        res.render("admin/pages/dashboard");
                    }
                    else {
                        res.redirect('/login');
                    }
                })
            }
            else {
                res.redirect('/login');
            }
        })
    }
]
const logout = [
    (req, res) => {
        req.session.loggedIn = false
        req.session.destroy();
        res.redirect('/login');
    }
];

module.exports = { loginView, login, logout };