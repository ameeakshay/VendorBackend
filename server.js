// server.js

// set up ======================================================================
// get all the tools we need
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 8080;

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

//Models
var models = require("./app/models");
 
models.sub_category.belongsTo(models.main_category);
models.tender.belongsTo(models.client);
models.tender.belongsTo(models.sub_category);

//Sync Database
models.sequelize.sync().then(function() {
 
    console.log('Nice! Database looks fine')
 
}).catch(function(err) {
 
    console.log(err, "Something went wrong with the Database Update!")
 
});

app.use(function(req, res, next) {

    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT'){
        jwt.verify(req.headers.authorization.split(' ')[1], 'ClientVendor', function(err, loggedInUser) {
            if (err) {
                req.user = undefined;
            }

            if (loggedInUser){
                req.user = loggedInUser;
            }
        });
    }
    else {
        req.user = undefined;
    }

    next();
});

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

require('./app/routes/index.js')(app);

// launch ======================================================================
app.listen(port);
console.log(`The magic happens on port ${port}`);
