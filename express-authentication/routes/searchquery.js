var express = require('express');
var passport = require('passport');

var router = express.Router();

// Mongo Database related
var database = require('../models/searchquery.js');

// ============================================================
router.get('/', function (req, res, next) {
    res.render('searchquery', { title: 'Search Query' });
});

// Returns the entire content of a collection 'users'
router.get('/all/', function (req, res) {
    returnAll('users', res);
});

// Returns the entire content of a collection
router.get('/all/:collection', function (req, res) {
    returnAll(req.params.collection, res);
});

// Return one document from ANY collection where the MongoDB ID matches
router.get('/one/:collection/:id', function (req, res) {
    returnOne(req.params.id, req.params.collection, res);
});

// Return queries based on Email
router.get('/one/:collection/email/:email', function (req, res) {
    returnQueries(req.params.email, req.params.collection, res);
});

// Return queries based on Passport details - DON'T WANT URL INJECTION, HACKERS
router.get('/one/:collection/user/all', function (req, res) {
    if ((req.isAuthenticated()) === true ) {
        console.log("**** User Login  ****");

        // Use email to find search queries
        var user_email = "";
        if (req.user) {
            if (req.user.local["email"] !== undefined ) {
                user_email = req.user.local["email"];
            } else if(req.user.google["email"] !== undefined) {
                user_email = req.user.google["email"];
            }

            console.log(user_email);
            returnQueries(user_email, req.params.collection, res);
        } else {
            console.log("No User");
        }
    } else {
        console.log("**** User Need to Login - GET /Login  ****");
        res.redirect('/login');
    }

});


// UPDATE OBJECT
router.post('/one/:collection/update/:id', function (req, res) {
    // console.log(req);
    console.log("+++++++++++ POST FUNCTION ++++++++++");
    console.log(req.body);
    updateQueries(req.params.id, req.params.collection, req.body, res);
});

// Insert (add) mongodb object
router.post('/save/:collection', function (req, res) {
    returnCreate(req.body, req.params.collection, res);
});

// Delete (remove) mongodb object
router.delete('/del/:collection', function (req, res) {
    database.remove(req.body, req.params.collection, function (toSend) {
        res.send(toSend);
    });
});


// ===================================================================
// Helper function with async callback - for read
var returnAll = function (collection, res) {
    database.get(collection, function (toSend) {
        res.send(toSend);
    });
};

// Helper function with async callback - for read single document
var returnOne = function (mongo_id, collection, res) {
    database.one(mongo_id, collection, function (toSend) {
        res.send(toSend);
    });
};

// Helper function with async callback - for read single document
var returnQueries = function (email, collection, res) {
    console.log(email);
    console.log(collection);
    database.email(email, collection, function (toSend) {
        res.send(toSend);
    });
};

// Put Function
var updateQueries = function (mongo_id, collection, toLoad, res) {
    console.log("+++++++ updateQueries function in searchquery.js +++++++++++++++");
    console.log(mongo_id);
    console.log(collection);
    console.log(toLoad);
    database.update(toLoad, mongo_id, collection, function (toSend) {
        res.send(toSend);
    });
};

// Helper function with async callback - for create
var returnCreate = function (toLoad, collection, res) {
    database.load(toLoad, collection, function (toSend) {
        res.send(toSend);
    });
};

module.exports = router;