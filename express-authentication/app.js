var express = require('express');
const fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var port = process.env.PORT || 3000;

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var flash = require('connect-flash');

// Session
var session = require('express-session');

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

var app = express();


// Define env - this is a node property, set on command line using NODE_ENV=[development|test|production]
// Defaults to development if not explicitly set
const env = app.get('env'); //
console.log("env=" + env);

// Configuration Variables
const config = JSON.parse( fs.readFileSync( process.env.CONFIG || "./config.json" ) );
config.environment = env;
config.version = JSON.parse( fs.readFileSync( "./package.json" ) ).version;
app.locals.config = config;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'mypdbusage' }));
app.use(passport.initialize());
app.use(passport.session());

// Session Information
console.log(passport.session());
console.log("++++++++++++++++++++++");
console.log(session);
console.log("++++++++++++++++++++++");

// https://stackoverflow.com/questions/36486397/passport-login-and-persisting-session
// https://www.airpair.com/express/posts/expressjs-and-passportjs-sessions-deep-dive

app.use(flash());

app.use('/', index);
app.use('/users', users);


require('./config/passport')(passport);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
        });
    });
}
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
    });
});

app.listen(port);

module.exports = app;
