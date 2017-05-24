var express = require('express');
var passport = require('passport');
// var mailer = require('express-mailer');
var bodyParser = require('body-parser');
var router = express.Router();

var session = require('express-session');


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// COULD WE ADD TO USER OBJECT
router.get('/', function(req, res, next) {
    res.render('index', { title: 'MyPDB Login', authenticate: req.isAuthenticated(), user: req.user });
    console.log(session);
    console.log(req.session.id);
    console.log(req.session.cookie);
    console.log(req.sessionID);
    console.log(req.session.secret);

    // s:A6MxxRv9ub3J9ChOf1a_YEeRNpI6oe7ab.Ezq0sASJ4lyyfX9qgg/UeqBPkKOmLUNz/xBcsNwLT5E
});

router.get('/login', function(req, res, next) {
    res.render('login.ejs', { title: 'Login', message: req.flash('loginMessage') });
});

router.get('/searchresults', function(req, res, next) {
    res.render('searchresults.ejs', { title: 'Search Results' , xml: req.body.xml,
        authenticate: req.isAuthenticated(), user: req.user
    });
});


// http://stackoverflow.com/questions/33624188/node-js-express-how-to-redirect-page-after-processing-post-request
router.post('/searchxml', function(req, res, next) {
    console.log("**** Send Query XML to MONGODB table specific to User  ****");
    console.log(req.body.xml);

    // RETURN BACK TO REQUEST
    res.json({ message: 'stored', query_xml: req.body.xml });
});

router.get('/searchxmlpage', function(req, res, next) {
    res.render('searchxml.ejs', { title: 'Search XML JSON', xml: req.body.xml });
});

router.get('/signup', function(req, res) {
    res.render('signup.ejs', { title: 'Sign Up',message: req.flash('signupMessage') });
});

router.get('/profile', isLoggedIn, function(req, res) {
    console.log("Set the Cookie");


    res.render('profile.ejs', { title: 'Profile Page', user: req.user });
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