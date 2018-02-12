// server.js

// set up ======================================================================
// get all the tools we need
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 8080;

const passport = require('passport');
const flash = require('connect-flash');
const env = require('dotenv').load();
const mailer = require('express-mailer');

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'vidyapathaisalwaysrunning',
    resave: true,
    saveUninitialized: true,
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

mailer.extend(app, {
  from: 'Venderapp',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
  user: 'radienerga@gmail.com', // gmail id
  pass: 'champions@1' // gmail password
  }
});

//Models
var models = require("./app/models");
 

//load passport strategies
 
require('./app/config/passport.js')(passport, models);

models.sub_category.belongsTo(models.main_category);
models.tender.belongsTo(models.client);
models.tender.belongsTo(models.sub_category);
models.verification.belongsTo(models.client);
models.verification.belongsTo(models.vendor);

//Sync Database
models.sequelize.sync().then(function() {
 
    console.log('Nice! Database looks fine')
 
}).catch(function(err) {
 
    console.log(err, "Something went wrong with the Database Update!")
 
});

// routes ======================================================================
require('./app/routes/routes.js')(app, passport, models); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log(`The magic happens on port ${port}`);
