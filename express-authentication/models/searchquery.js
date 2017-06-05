var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mdb = require('mongodb');

// Config options
var url = 'mongodb://localhost:27017/expressauth';

// ============================================================
// Public functions
exports.load = function (object, collection, callback) {
    createWrapper(object, collection, callback);
};

exports.get = function (object, callback) {
    readWrapper(object, callback);
};


// ============================================================
// Private (meta) functions
var createWrapper = function (object, collection, callback) {
    MongoClient.connect(url, function (err, db) {
        console.log("++++++++++++ CREATE WRAPPER: +1 DB connection +++++++++++++");
        assert.equal(null, err);
        insertProject(db, object, collection, function (result) {
            end(db);
            callback(result);
        });
    });
};

var readWrapper = function (object, callback) {
    MongoClient.connect(url, function (err, db) {
        console.log("++++++++++++ READ WRAPPER: +1 DB connection ++++++++++++++");
        assert.equal(null, err);
        var docHolder;
        findDocuments(db, object, function (docHolder) {
            end(db);
            callback(docHolder);
            console.log("++++++++++++ READ WRAPPER ++++++++++++++++");
            console.log(docHolder);
        });
    });
};

// Insert
var insertProject = function (db, object, collection, callback) {
    // Get the documents collection
    console.log("About to insert to [", collection, "]");
    var my_collection = db.collection(collection);
    // Insert the document
    my_collection.insert(object, function (err, result) {
        assert.equal(err, null);
        assert.equal(object.length, result.length);
        callback(result);
    });
};

// ============================================================
// Individual functions

// Disconnect
var end = function (db) {
    db.close();
    console.log("-1 DB close");
}


// ============================================================
// Individual functions
var findDocuments = function (db, object, callback) {
    // Get the documents collection
    var collection = db.collection(object);
    // Find some documents
    collection.find({}).sort({id: -1}).toArray(function (err, docs) {
        assert.equal(err, null);
        console.log("++++++++++++ FIND DOCUMENTS ++++++++++++++++");
        console.dir(docs);
        callback(docs);
    });
};