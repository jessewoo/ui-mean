$(function () {
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
                    // Clean up the XML data
                    queryXML = queryXML.replace(/<queryId>[\s\S]*?<\/queryId>/g, '');
                    queryXML = queryXML.replace(/<resultCount>[\s\S]*?<\/resultCount>/g, '');
                    queryXML = queryXML.replace(/<runtimeStart>[\s\S]*?<\/runtimeStart>/g, '');
                    queryXML = queryXML.replace(/<runtimeMilliseconds>[\s\S]*?<\/runtimeMilliseconds>/g, '');
                    $('#queryXML').val(queryXML);

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

            searchQueryArray.push(singleSearchQuery)

            // Check user email, if it exist in database already, update the object with new query
            // ---- OR ------
            // If user email doesn't exist in database, create a new object with new query

            content.search_queries = searchQueryArray;

            console.log(content);

            // Log (display to console) the result
            var json = JSON.stringify(content);
            console.log("Sending: " + json);

            // Send result to server for saving to object database
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

});

