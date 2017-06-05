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
    res.render('index', { title: 'MyPDB Login',
        authenticate: req.isAuthenticated(), user: req.user
    });
    console.log(req.session.id);
});

router.get('/login', function(req, res, next) {
    if ((req.isAuthenticated()) == true ) {
        console.log("**** User Login  ****");
        res.redirect('/profile');
    } else {
        console.log("**** User Need to Login  ****");
        res.render('login', { title: 'Login', message: req.flash('loginMessage'),
            authenticate: req.isAuthenticated(), user: req.user
        });
    }
});

router.get('/searchresults', function(req, res, next) {
    res.render('searchresults', { title: 'Search Results' , xml: req.body.xml,
        authenticate: req.isAuthenticated(), user: req.user
    });
});

// http://stackoverflow.com/questions/33624188/node-js-express-how-to-redirect-page-after-processing-post-request
router.post('/searchxml', function(req, res, next) {
    console.log(req.isAuthenticated());

    if ((req.isAuthenticated()) == true ) {
        console.log("**** Send Query XML to MONGODB table specific to User  ****");
        console.log(req.body.xml);

        // RETURN BACK TO REQUEST
        res.json({ message: 'stored', query_xml: req.body.xml });
    } else {
        res.json({ message: 'need to login'});

        // http://mherman.org/blog/2015/07/02/handling-user-authentication-with-the-mean-stack/#.WSdR7hPyvUI
        // http://www.alanflavell.org.uk/www/post-redirect.html
        // https://stackoverflow.com/questions/199099/how-to-manage-a-redirect-request-after-a-jquery-ajax-call

        console.log("**** Send User to Profile Page ****");
        // res.redirect('/profile');
        // res.redirect(307, '/profile');
        // next({ type: 'database', error: 'datacenter blew up' });

        // console.log(next());

        // next(res.render('profile',  { title: 'Profile', xml: req.body.xml }))
    }
});

router.get('/searchxmlpage', function(req, res, next) {
    res.render('searchxml', { title: 'Search XML JSON', xml: req.body.xml });
});

router.get('/signup', function(req, res) {
    res.render('signup', { title: 'Sign Up',message: req.flash('signupMessage') });
});

router.get('/profile', isLoggedIn, function(req, res) {
    console.log("Set the Cookie");

    console.log(req.user._id);

    var userid;
    if (req.user.local.email) {
        userid = req.user.local.email;
    }
    if (req.user.google.id) {
        userid = req.user.google.email;
    }

    res.cookie('LoggedIn_UserId', userid, { maxAge: 900000, httpOnly: true });
    res.render('profile.ejs', { title: 'Profile Page', user: req.user });
});

router.get('/logout', function(req, res) {
    res.clearCookie('LoggedIn_UserId');
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

function isLoggedIn_SavedXML(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}