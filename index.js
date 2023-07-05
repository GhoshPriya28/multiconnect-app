const express = require('express');
const app = express();
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
var bodyParser = require('body-parser')
const connectDB = require('./src/config/db.config')
var flash = require('express-flash');
var session = require('express-session');
const helpers = require("./src/helpers/helpers.js")


helpers(app)

app.use(session({
  name: `daffyduck`, 
  secret: 'mysecret',
   saveUninitialized: true,
    cookie: { secure: false },
    resave: true,
}));

app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});
app.use(flash({ sessionKeyName: 'flashMessage' }));
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use("/downloads", express.static(path.resolve(__dirname + '/src/downloads')));
app.set('views', __dirname+'/src/views/');

//Routes
app.use('/', require('./src/routes/adminRoutes.js'));

const PORT = process.env.PORT || 4111;
app.listen(PORT, console.log("Server is running on port: " + PORT))
