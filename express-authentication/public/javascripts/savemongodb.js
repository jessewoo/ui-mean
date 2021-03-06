console.log("Save XML to MongoDB");

function clearUpXML(noncleanXML) {
    if (noncleanXML.length > 0) {
        var cleanedUpQueryXML;

        // For COMPOSITION QUERY - take out the version number
        noncleanXML = noncleanXML.replace(/<orgPdbCompositeQuery version="1.0">/g, '<orgPdbCompositeQuery>');
        noncleanXML = noncleanXML.replace(/<version>[\s\S]*?<\/version>/g, '');
        noncleanXML = noncleanXML.replace(/<queryRefinementLevel>[\s\S]*?<\/queryRefinementLevel>/g, '');
        noncleanXML = noncleanXML.replace(/<queryId>[\s\S]*?<\/queryId>/g, '');
        noncleanXML = noncleanXML.replace(/<description>[\s\S]*?<\/description>/g, '');
        noncleanXML = noncleanXML.replace(/<resultCount>[\s\S]*?<\/resultCount>/g, '');
        noncleanXML = noncleanXML.replace(/<runtimeStart>[\s\S]*?<\/runtimeStart>/g, '');
        cleanedUpQueryXML = noncleanXML.replace(/<runtimeMilliseconds>[\s\S]*?<\/runtimeMilliseconds>/g, '');

        return cleanedUpQueryXML;

    } else {
        console.log("no XML in field");
    }
}


$(document).on('click', '#cleanXMLData', function () {
    var noncleanXML = $('#queryXML').val();
    var cleanXML = clearUpXML(noncleanXML);

    $('#queryXML').val(cleanXML);
});


$(document).on('click', '#saveQueryXML-Object', function () {
    var content = new Object();

    if ($("#userEmail").val()) {

        var user_email = $("#userEmail").val();

        $.ajax({
            type: "get",
            url: "/searchquery/one/queries/user/all",
            dataType: "json",
            contentType: "application/json",
            success: function (data) {
                console.log("Retrieved Data with email: " + user_email);
                console.log(data);

                // Email Exist in DB
                content.email = user_email;

                // Search Query
                var searchQueryArray = new Array();
                var singleQuery = new Object();
                var old_id;

                // Take XML Query from Form
                singleQuery.next_scheduled_run = $('input[name="next_scheduled_run"]:checked').val();
                singleQuery.email_notification = $('input[name="email_notification"]:checked').val();
                singleQuery.query_description = $('#searchQueryTitle').val();

                var noncleanXML = $('#queryXML').val();
                var cleanXML = clearUpXML(noncleanXML);
                $('#queryXML').val(cleanXML);

                singleQuery.query_xml = $('#queryXML').val();

                searchQueryArray.push(singleQuery);
                content.search_queries = searchQueryArray;

                // If email doesn't exist, create a new object with query
                // If email exist, update the object with new query and delete that object
                if ($.isEmptyObject(data)) {
                    console.log("Data Object is Empty: Add in DB");
                } else {
                    console.log("Data Object is NOT Empty, Object with Email Already Exist");
                    console.log(data[0]["email"]);

                    // Old MongoDB Id
                    old_id = data[0]["_id"];

                    // Push into existing array of "search_queries"
                    $.each(data[0]["search_queries"], function (index, object) {
                        // console.log(object);
                        searchQueryArray.push(object);
                    });
                    content.search_queries = searchQueryArray;
                    // console.log(content);
                }

                // JSON construction
                var json = JSON.stringify(content);
                console.log("Sending to DB: " + json);

                console.log(old_id);

                // If user email doesn't exist in database, create a new object with new query
                $.ajax({
                    type: "post",
                    url: "/searchquery/save/queries",
                    dataType: "json",
                    data: json,
                    contentType: "application/json",
                    success: function (data) {
                        console.log("Item saved to database!");
                        console.log(data);
                        console.log("New ID:" + data.insertedIds[0]);

                        // DELETE THE ORIGINAL
                        var prep = {};
                        prep.id = old_id;
                        // console.log("prep", prep);
                        var json2 = JSON.stringify(prep);
                        console.log('Requesting delete of ->', json2);
                        $.ajax({
                            type: "delete",
                            url: "/searchquery/del/queries",
                            dataType: "json",
                            data: json2,
                            contentType: "application/json",
                            success: function(data2){
                                console.log("Item removed from the database!");
                                // console.log(data2);

                                // After Deleting
                                // window.location.replace("/userqueries");
                            },
                            error: function(err2){
                                console.log("ERROR: Unable remove the item from the database!", err2);
                            }
                        });
                    },
                    error: function (err) {
                        console.log("ERROR: Unable save the item to the database!", err);
                    }
                });

            },
            error: function (err) {
                console.log("ERROR: Unable to retrieve data!", err);
            }
        });

    } else {
        console.error("No Email");
    }
});



$(document).on('click', '#insertDummyData', function () {
    $.ajax({
        type: "get",
        url: "/data/dummy.json",
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            console.log("Insert Data to Form");

            if (data["Query XML"]) {

                var regex_description = /<description>(.*)<\/description>/;
                var match_description = data["Query XML"].match(regex_description);
                var final_description = match_description[1];
                console.log(match_description[1]);

                $('#searchQueryTitle').val(final_description);

                var queryXML = data["Query XML"];
                var cleanXML2 = clearUpXML(queryXML);

                $('#queryXML').val(cleanXML2);
            }
        },
        error: function (err) {
            console.log("ERROR: Unable to retrieve data!", err);
        }
    });
});


$(document).on('click', '#saveQueryXML', function () {
    // Cast an empty object for us to populate
    var content = new Object();

    // User Email
    if ($("#userEmail").val()) {
        content.email = $("#userEmail").val();

        var searchQueryArray = new Array();

        var singleSearchQuery = new Object();
        singleSearchQuery.next_scheduled_run = $('input[name="next_scheduled_run"]:checked').val();
        singleSearchQuery.email_notification = $('input[name="email_notification"]:checked').val();
        singleSearchQuery.query_description = $('#searchQueryTitle').val();
        singleSearchQuery.query_xml = $('#queryXML').val();

        searchQueryArray.push(singleSearchQuery);

        // Check user email, if it exist in database already, update the object with new query
        // ---- OR ------
        // If user email doesn't exist in database, create a new object with new query

        content.search_queries = searchQueryArray;

        console.log(content);

        // Log (display to console) the result
        var json = JSON.stringify(content);
        console.log("Sending: " + json);

        // Send result to server for saving to object database

        // If user email doesn't exist in database, create a new object with new query
        $.ajax({
            type: "post",
            url: "/searchquery/save/queries",
            dataType: "json",
            data: json,
            contentType: "application/json",
            success: function (data) {
                console.log("Item saved to database!");
                window.location.replace("/profile");
            },
            error: function (err) {
                console.log("ERROR: Unable save the item to the database!", err);
            }
        });
    } else {
        // Email should be retrieved from the PassportJS Authentication
        console.error("No Email");
    }
});


