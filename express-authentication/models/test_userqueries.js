// NEED TO CONTINUE TO MODIFY

const mongodb = require('mongodb');
const util = require('./util');
const mongoose = require("mongoose");
const monk = require('monk');
var options = {};
options.autoReconnect = true;
options.connectTimeoutMS = 5000;
options.socketTimeoutMS = 5000;
options.reconnectInterval = 500;
options.reconnectTries = 10000;

queries_db_location = '127.0.0.1:27017/expressauth';

const db = monk(queries_db_location, options);

// Use native promises
// mongoose.Promise = global.Promise;

module.exports = {
    /**
     * Various list views of the database content
     * @param req
     * @param res
     */
    getList: function (req, res) {
        var type = "";
        var type_provided = false;
        var count = "";
        var count_provided = false;
        var query = {};

        if (typeof req.params.type !== 'undefined') {
            type = req.params.type;
            type_provided = true;
            if (type != "all") {
                query["channel." + type] = true;
            }
        }
        if (typeof req.params.how_many !== 'undefined') {
            count = parseInt(req.params.how_many);
            count_provided = true;
        }

        if (count_provided) {
            if (type_provided) {
                // Get X number of THIS type
                db.get('news').find(query, {limit: count, sort : {'release.time_unix': -1}}, function (e, items) {
                    if (e) {
                        console.error(e);
                    }
                    res.render('news/list', {title: 'News List', items: items, source: type});
                });
            } else {
                // Get X number of ALL types
                db.get('news').find(query, {limit: count, sort : {'release.time_unix': -1}}, function (e, items) {
                    if (e) {
                        console.error(e);
                    }
                    res.render('news/list', {title: 'News List', items: items, source: type});
                });
            }
        } else {
            if (type_provided) {
                db.get('news').find(query, {sort : {'release.time_unix': -1}}, function (e, items) {
                    if (e) {
                        console.error(e);
                    }
                    res.render('news/list', {title: 'News List', items: items, source: type});
                });
            } else {
                // Get ALL of ALL types
                db.get('news').find({}, {sort : {'release.time_unix': -1}}, function (e, items) {
                    if (e) {
                        console.error(e);
                    }
                    res.render('news/list', {title: 'News List', items: items, source: type});
                });
            }
        }
    },

    /**
     * GUI to edit a NEW or EXISTING news item
     * @param req
     * @param res
     */
    getItem: function (req, res) {
        db.get('news').findOne(req.params._id, {}, function (e, item) {
            res.render('news/editor', {title: 'Editing: ' + req.params._id, item: item});
        });
    },

    /**
     * Returns a single object from the news collection, by id, in JSON format
     * @param req
     * @param res
     */
    getItemJson: function (req, res) {
        db.get('news').findOne(req.params._id, {}, function (e, item) {
            res.json(item);
        });
    },

    /**
     * Delete ONE news article
     * @param req
     * @param res
     */
    removeItem: function (req, res) {
        var pattern = /^[0-9A-F]{24}$/i;
        var check = pattern.test(req.params.id);
        if (check) {
            db.get('news').remove({_id: new mongodb.ObjectId(req.params.id)}, function (err, result) {
                if (err) {
                    console.error("Failed to delete news item [" + req.params.id + "]");
                    res.status(400).send({error: err});
                } else {
                    console.log("Removed news item [" + req.params.id + "]");
                    res.status(200).send({success: result});
                }
            });
        } else {
            console.error("Invalid ID syntax");
            res.status(400).send({error: 'Invalid ID syntax'});
        }
    },

    /**
     * Blind inserts a new news item
     * @param req
     * @param res
     */
    createItem: function (req, res) {
        console.log("Inserting:");
        var pretty = JSON.stringify(req.body, null, 3);
        console.log(pretty);
        db.get('news').insert(req.body, function (err, result) {
            if (err) {
                res.status(400).send({error: err});
            } else {
                res.status(200).send({success: result});
            }
        });
    },

    /**
     * Replace an existing news item with the data just sent
     * @param req
     * @param res
     */
    updateItem: function (req, res) {
        console.log("Updating [" + req.params.id + "]");
        var pretty = JSON.stringify(req.body, null, 3);
        console.log(pretty);
        var which_object = {};
        which_object._id = req.params.id;
        db.get('news').update(which_object, req.body, function (err, result) {
            if (err) {
                res.status(400).send({error: err});
            } else {
                res.status(200).send({success: result});
            }
        });
    },

    /**
     * Can be used to directly update an entire news item from the backend
     * @param id
     * @param news_object
     */
    updateItemDirectly: function (id, news_object) {
        console.log("Updating [" + id + "]");
        var pretty = JSON.stringify(news_object, null, 3);
        console.log(pretty);
        var which_object = {};
        which_object._id = id;
        db.get('news').update(which_object, news_object, function (err) {
            // Return false on error, true on success
            return !err;
        });
    },

    /**
     * Update a document (by ID) to have a last access time of now as well as mark who requested access
     * @param id
     * @param who
     * @param callback
     */
    setItemLastAccess: function (id, who, callback) {
        console.log("Marking [" + id + "] as last access by [" + who + "]");
        var which_object = {};
        which_object._id = id;
        var timeNow = new Date().getTime();
        db.get('news').update(which_object, {$set : {"last_accessed_by": who, "last_accessed_on": timeNow}}, function (err) {
            // Return false on error, true on success
            callback(!err);
        });
    },

    /**
     * Clears who was last editing an item
     * @patam id
     * @param callback
     */
    unsetItemLastAccess: function (id, callback) {
        console.log("UNMARKING [" + id + "]");
        var which_object = {};
        which_object._id = id;
        db.get('news').update(which_object, {$unset : {"last_accessed_by": "", "last_accessed_on": ""}}, function (err) {
            // Return false on error, true on success
            callback(!err);
        });
    },

    getRawRepStatus: function (req, res) {
        var conn = mongoose.createConnection(db_cluster_admin);
        conn.on("open",function() {
            conn.db.command({"replSetGetStatus":1 },function(err,result) {
                if (err) {
                    res.status(400).send({error: err});
                } else {
                    res.status(200).send(result);
                }
                conn.close();
            });
        });
    },

    getRepStatus: function (req, res) {
        var conn = mongoose.createConnection(db_cluster_admin);
        conn.on("open",function() {
            conn.db.command({"replSetGetStatus":1 },function(err, result) {
                var object = {};
                if (err) {
                    if (err.message == "not running with --replSet") {
                        object.primary = 0;
                        object.secondary = 0;
                        object.down = 0;
                        object.other = 0;
                        object.not_clustered = 1;

                        res.status(200).send(object);
                    } else {
                        res.status(400).send({error: err});
                    }
                } else {
                    object.primary = 0;
                    object.secondary = 0;
                    object.down = 0;
                    object.other = 0;
                    object.not_clustered = 0;

                    if (typeof result !== 'undefined') {
                        if (typeof result.members !== 'undefined') {
                            var arrayLength = result.members.length;
                            for (var i = 0; i < arrayLength; i++) {
                                if (result.members[i].stateStr == "PRIMARY") {
                                    object.primary = object.primary + 1;
                                } else if (result.members[i].stateStr == "SECONDARY") {
                                    object.secondary = object.secondary + 1;
                                } else if (result.members[i].stateStr == "DOWN") {
                                    object.down = object.down + 1;
                                } else {
                                    object.other = object.other + 1;
                                }
                            }
                        } else {
                            console.error("No results.members");
                        }
                    } else {
                        console.error("No results");
                    }
                    res.status(200).send(object);
                }
                conn.close();
            });
        });
    }
}
