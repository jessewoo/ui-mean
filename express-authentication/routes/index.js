var express = require('express');
var passport = require('passport');
// var mailer = require('express-mailer');
var bodyParser = require('body-parser');

var router = express.Router();

/*
mailer.extend(app, {
    from: 'no-reply@example.com',
    host: 'smtp.gmail.com', // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
        user: '',
        pass: ''
    }
});
*/


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', function(req, res, next) {
    res.render('index', { title: 'MyPDB Login' });
});

router.get('/login', function(req, res, next) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
});

router.get('/searchresults', function(req, res, next) {
    res.render('searchresults.ejs', { title: 'Search Results' , xml: req.body.xml});
});


// http://stackoverflow.com/questions/33624188/node-js-express-how-to-redirect-page-after-processing-post-request
router.post('/searchxml', function(req, res, next) {
    console.log("**** Send Query XML to MONGODB table specific to User  ****");
    console.log(req.body.xml);

    // console.log(res);
    // console.log(next);

    // RETURN BACK TO REQUEST
    res.json({ message: 'stored', query_xml: req.body.xml });
});

router.get('/searchxmlpage', function(req, res, next) {
    res.render('searchxml.ejs', { title: 'Search XML JSON', xml: req.body.xml });
});

router.get('/signup', function(req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
});

router.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', { user: req.user });
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

// Google routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/'
}));


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}