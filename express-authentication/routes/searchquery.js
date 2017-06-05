var express = require('express');
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

// Helper function with async callback - for create
var returnCreate = function (toLoad, collection, res) {
    database.load(toLoad, collection, function (toSend) {
        res.send(toSend);
    });
};

module.exports = router;
