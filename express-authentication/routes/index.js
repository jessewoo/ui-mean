var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var router = express.Router();

var session = require('express-session');

var User = require('../models/user');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// COULD WE ADD TO USER OBJECT
router.get('/', function(req, res, next) {

    const config = req.app.locals.config;

    res.render('index', { title: 'MyPDB Login',
        authenticate: req.isAuthenticated(), user: req.user, config: config
    });
    console.log(req.session.id);

    console.log("Configuration File:" + config.mailerLogin);
});

router.get('/login', function(req, res, next) {
    if ((req.isAuthenticated()) == true ) {
        console.log("**** User Login  ****");
        res.redirect('/profile');
    } else {
        console.log("**** User Need to Login - GET /Login  ****");

        // https://www.codementor.io/tips/7514243748/how-do-i-redirect-in-expressjs-while-passing-some-context
        // Need to remember the previous page that it was going to, once logged in, then go to next page
        console.log(req.body);
        console.log(req);
        res.render('login', { title: 'Login', message: req.flash('loginMessage'),
            authenticate: req.isAuthenticated(), user: req.user
        });
    }
});

router.get('/searchform', function(req, res, next) {
    var xml = "";

    // Use email to find search queries
    var user_email = "";
    if (req.user) {
        if (req.user.local["email"] !== undefined ) {
            user_email = req.user.local["email"];
        } else if(req.user.google["email"] !== undefined) {
            user_email = req.user.google["email"];
        }
        console.log(user_email);
    } else {
        console.log("no user");
    }

    if ((req.isAuthenticated()) == true ) {
        console.log("**** GET: User Login > Search Form  ****");

        res.render('searchform', { title: 'Search Form', message: req.flash('loginMessage'), authenticate: req.isAuthenticated(), user: req.user, xml_text: xml, user_email: user_email});
    } else {
        console.log("**** User Need to Login  ****");
        res.redirect('/login');
    }
});

router.post('/searchform', function(req, res, next) {

    // console.log(req);

    console.log(req.body.xml_text_search_results);
    var xml = req.body.xml_text_search_results;
    // console.log(xml);
    // var xml = "Going from Search Results Page - TESTING";

    // Use email to find search queries
    var user_email = "";

    if (req.user.local["email"] !== undefined ) {
        user_email = req.user.local["email"];
    } else if(req.user.google["email"] !== undefined) {
        user_email = req.user.google["email"];
    }
    console.log(user_email);


    if ((req.isAuthenticated()) == true ) {
        console.log("**** POST: User Login > Search Form  ****");
        res.render('searchform', { title: 'Search Form', message: req.flash('loginMessage'), authenticate: req.isAuthenticated(), user: req.user, xml_text: xml, user_email: user_email});
    } else {
        console.log("**** User Need to Login  ****");
        res.redirect('/login');
    }

});

router.get('/userqueries', function(req, res, next) {
    if ((req.isAuthenticated()) == true ) {
        console.log("**** User Login > User Queries  ****");

        // Use email to find search queries
        var user_email;

        if (req.user.local["email"] !== undefined ) {
            user_email = req.user.local["email"];
        } else if(req.user.google["email"] !== undefined) {
            user_email = req.user.google["email"];
        }

        console.log(user_email);

        res.render('userqueries', { title: 'User Queries', message: req.flash('userQueries'), authenticate: req.isAuthenticated(), user: req.user, user_email: user_email});
    } else {
        console.log("**** User Need to Login  ****");
        res.redirect('/login');
    }
});

router.get('/alluserqueries', function(req, res, next) {

    if ((req.isAuthenticated()) == true ) {
        console.log("**** User Login > User Queries  ****");

        // Use email to find search queries
        var user_email = "";
        if (req.user.local["email"] !== undefined ) {
            user_email = req.user.local["email"];
        } else if(req.user.google["email"] !== undefined) {
            user_email = req.user.google["email"];
        }

        console.log(user_email);

        res.render('alluserqueries', { title: 'All User Queries', authenticate: req.isAuthenticated(), user: req.user, user_email: user_email});
    } else {
        console.log("**** User Need to Login  ****");
        res.redirect('/login');
    }
});


router.get('/searchresults', function(req, res, next) {
    res.render('searchresults', { title: 'Search Results', xml: req.body.xml,
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


// +++++++ RESET PASSWORD PAGES ++++++++++
// Find the page for "Password Reset"
router.get('/forgot', function(req, res) {
    res.render('forgot', {
        user: req.user,
        message: req.flash('forgotMessage')
    });
});


router.post('/forgot', function(req, res, next) {

    const config = req.app.locals.config;
    console.log(req.body);
    console.log('local.email: ' + req.body.email);

    var userEmail = req.body.email;

    // Runs an array of functions in series, each passing their results to the next in the array. However, if any of the functions pass an error to the callback, the next function is not executed and the main callback is immediately called with the error.
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                console.log(token);
                done(err, token);
            });
        },
        function(token, done) {
            // console.log(User.findOne({ 'local.email': userEmail }));

            // NEED TO SET IT: passport.use('forgot-password', new LocalStrategy)
            User.findOne({ 'local.email': userEmail }, function(err, user) {
                console.log(user);

                if (!user) {
                    req.flash('forgotMessage', 'No account with that email address exists.');
                    console.log("USER DOESN'T EXIST!");
                    return res.redirect('/forgot');
                }
                // Update the one user
                user.local.resetPasswordToken = token;
                user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                console.log("+++++++++++++");
                console.log(user);
                console.log("+++++++++++++");
                user.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    return done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            console.log(token);
            console.log(user);

            // Create the Nodemailer
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.mailerLogin,
                    pass: config.mailerPassword
                }
            });
            var mailOptions = {
                to: 'jesse.woo@rcsb.org',
                from: config.mailerLogin,
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                req.body.email + "\n\n" +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };

            transporter.sendMail(mailOptions, function(err,info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("++++++++++ EMAIL SENT +++++++++");
                    console.log('Email sent: ' + info.response);
                }
                req.flash('forgotMessage', 'An e-mail has been sent to ' + req.body.email  + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) {
            console.log("ERROR with ASYNC WATERFALL");
            return next(err);
        }
        // END WITH RESPONSE
        res.redirect('/forgot');
    });
});


router.get('/reset/:token', function(req, res) {
    console.log("RESET " + req.params.token);
    User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('forgotMessage', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {
            user: req.user,
            token: req.params.token,
            message: req.flash('resetMessage')
        });

        console.log(user);
    });
});


router.post('/reset/:token', function(req, res, next) {

    const config = req.app.locals.config;
    console.log(req.body);

    async.waterfall([
        function(done) {
            User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('resetMessage', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                // In a real-world scenario you would compare req.body.confirm with req.body.password to see if they are equal.

                console.log("COMPARING PASSWORD");
                console.log(user.comparePassword(req.body.password, req.body.confirm));

                console.log("Email FIND ONE: " + user.local.email);

                // Need to
                user.local.password = user.generateHash(req.body.password);
                user.local.resetPasswordToken = undefined;
                user.local.resetPasswordExpires = undefined;

                user.save(function(err) {
                    req.logIn(user, function(err) {
                        done(err, user);
                    });
                });
            });
        },
        function(user, done) {
            console.log(user);

            // Create the Nodemailer
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.mailerLogin,
                    pass: config.mailerPassword
                }
            });
            var mailOptions = {
                to: 'jesse.woo@rcsb.org',
                from: config.mailerLogin,
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.local.email + "\n\n"
            };

            transporter.sendMail(mailOptions, function(err,info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("++++++++++ EMAIL SENT +++++++++");
                    console.log('Email sent: ' + info.response);
                }
                req.flash('resetMessage', 'Success! Your password has been changed');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) {
            console.log("ERROR with ASYNC WATERFALL");
            return next(err);
        }
        // END WITH RESPONSE
        res.redirect('/');
    });
});


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

// HOW DO EXPORT COMMON FUNCTIONS