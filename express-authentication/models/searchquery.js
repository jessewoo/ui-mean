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

exports.one = function (mongo_id, collection, callback) {
    oneWrapper(mongo_id, collection, callback);
};

exports.email = function (email, collection, callback) {
    readQueriesWrapper(email, collection, callback);
};

exports.update = function (object, mongo_id, collection, callback) {
    console.log(object);
    updateQueriesWrapper(object, mongo_id, collection, callback);
};

exports.get = function (object, callback) {
    readWrapper(object, callback);
};

exports.remove = function (target, collection, callback) {
    console.log("Top -", target);
    deleteWrapper(target, collection, callback);
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

var oneWrapper = function (mongo_id, collection, callback) {
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        findOneDocument(db, mongo_id, collection, function (result) {
            end(db);
            callback(result);
        });
    });
};

var deleteWrapper = function (target, collection, callback) {
    MongoClient.connect(url, function (err, db) {
        console.log("+1 DB connection - DELETE");
        assert.equal(null, err);
        removeDocument(db, target.id, collection, function (result) {
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

var readQueriesWrapper = function (email, collection, callback) {
    MongoClient.connect(url, function (err, db) {
        console.log("++++++++++++ READ QUERIES WRAPPER: +1 DB connection ++++++++++++++");
        assert.equal(null, err);
        findDocumentsByEmail(db, email, collection, function (result) {
            end(db);
            callback(result);
        });

    });
};


var updateQueriesWrapper = function (object, mongo_id, collection, callback) {
    MongoClient.connect(url, function (err, db) {
        console.log("++++++++++++ UPDATE QUERIES WRAPPER: +1 DB connection ++++++++++++++");
        console.log(object);
        assert.equal(null, err);
        updateDocumentsByMongoId(db, object, mongo_id, collection, function (result) {
            end(db);
            callback(result);
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

// Find one motm_articles (by mongo db id)
var findOneDocument = function (db, id, collection, callback) {
    console.log("Finding documenet in the database ->", id);

    console.log("Database ->", db);
    console.log("Collecton ->", collection);
    console.log("Callback ->", callback);

    var my_collection = db.collection(collection);
    // Verify passed mongo db id is valid hex
    var pattern = /^[0-9A-F]{24}$/i;
    var check = pattern.test(id);
    if (check) {
        console.log("This is valid hex [", id, "]");
        my_collection.find({_id: new mdb.ObjectID(id)}).toArray(function (err, docArray) {
            assert.equal(err, null);
            //console.log("docArray", docArray);
            callback(docArray[0])
        });
    } else {
        console.log("INVALID HEX!!! [", id, "]");
        callback(undefined);
    }
};

// Find Documents (by email)
var findDocumentsByEmail = function (db, email, collection, callback) {
    console.log("Finding document by email in the database ->", email);
    // console.log("Database ->", db);
    // console.log("Collection ->", collection);
    // console.log("Callback ->", callback);

    var my_collection = db.collection(collection);
    // console.log(my_collection);

    my_collection.find({email: email}).toArray(function (err, docArray) {
        assert.equal(err, null);
        console.log("docArray", docArray);
        // console.log(docArray[0]);
        callback(docArray);
    });
};


// Update one motm_articles (by mongo db id)
// Will update the preferred email as well
var updateDocumentsByMongoId = function (db, object, id, collection, callback) {
    console.log("Update document in the database ->", id);
    // console.log("Database ->", db);
    console.log("Collection ->", collection);
    console.log("Object ->", object);
    console.log("Callback ->", callback);

    var my_collection = db.collection(collection);
    // Verify passed mongo db id is valid hex
    var pattern = /^[0-9A-F]{24}$/i;
    var check = pattern.test(id);
    if (check) {
        console.log("This is valid hex [", id, "]");
        my_collection.update({ '_id': new mdb.ObjectID(id) }, { $set: { 'search_queries': JSON.parse(object.search_queries), 'preferred_email': object.preferred_email } }, function(err) {
            assert.equal(err, null);
            callback(!err)
        });

    } else {
        console.log("INVALID HEX!!! [", id, "]");
        callback(undefined);
    }
};

// Remove
var removeDocument = function (db, target, collection, callback) {
    // Get the documents collection
    console.log("About to remove [", target, "] from [", collection, "]");
    var my_collection = db.collection(collection);
    // Verify passed mongo db id is valid hex
    var pattern = /[0-9A-F]{24}/i;
    var check = pattern.test(target);
    if (check) {
        console.log("This is valid hex [", target, "]");
        my_collection.remove({_id: new mdb.ObjectID(target)}, function (err, result) {
            assert.equal(err, null);
            console.log("Result: " + result);
            callback(result);
        });
    } else {
        console.log("INVALID HEX!!! [", target, "]");
        callback(undefined);
    }
}