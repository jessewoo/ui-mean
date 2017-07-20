var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/trial', function(req, res) {
    const config = req.app.locals.config;

    // Create the Nodemailer
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.mailerLogin,
            pass: config.mailerPassword
        }
    });

    var mailOptions = {
        from: config.mailerLogin,
        to: 'jesse.woo@rcsb.org',
        subject: 'Sending Email using Node.js',
        html: '<h1>Welcome</h1><p>That was easy!</p>'
    };

    // Send Email
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log("++++++++++ EMAIL SENT +++++++++");
            console.log('Email sent: ' + info.response);
            res.send('Email Sent!');
        }
    });
});


router.post('/contact', function(req, res) {
    const config = req.app.locals.config;

    console.log(req.body);
    var data = {
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message
    };

    // Create the Nodemailer
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.mailerLogin,
            pass: config.mailerPassword
        }
    });

    var mailOptions = {
        from: config.mailerLogin,
        to: data.email,
        subject: data.subject,
        html: '<h1>User Query</h1><p>' + data.message + '</p>'
    };

    // Send Email
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log("++++++++++ EMAIL SENT +++++++++");
            console.log('Email sent: ' + info.response);

            res.send('DONE from transporter.sendMail');
        }
    });
});

module.exports = router;