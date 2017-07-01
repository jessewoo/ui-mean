// Retrieve MongoDB data for user
$(document).ready(function () {
    $("#saveUserQueries").hide();
});

$(document).on('click', '.submitRestButton', function ( event ) {

    event.preventDefault();
    var xmlText = $(this).attr("alt");
    console.log(xmlText);

    $("#xml_text_value").val(xmlText);

    $('#submitForSearchResults').submit();
});

$(document).on('click', '#viewUserQueries', function () {

    var user_email = $('#user_email').html();
    console.log(user_email);

    $.ajax({
        type: "get",
        url: "/searchquery/one/queries/email/" + user_email,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            console.log("Retrieve Data from MongoDB for searchQueries table");
            console.log(data);

            // DATA - Loop thru each object
            $.each(data[0]["search_queries"], function (index, object) {
                // Build HTML code for the table row

                // console.log(object["query_xml"]);
                // var xmlText = new XMLSerializer().serializeToString(object["query_xml"]);

                // Query Description should be unique

                // Dropdown

                var newRow = "<tr class='center'>";
                newRow += "<td>" + selectDropdownWorker(["monthly","weekly","none"],object["next_scheduled_run"]) + "</td>";
                newRow += "<td>" + selectDropdownWorker(["true","false"],object["email_notification"]) + "</td>";
                newRow += "<td>" + object["query_description"] + "</td>";
                newRow += "<td><input class='btn btn-primary submitRestButton' type='submit' value='Search' alt='" + object["query_xml"].toString() + "'></td>";
                newRow += "</tr>";

                $("#savedUserQueries > tbody:last-child").append(newRow);
            });
        },
        error: function (err) {
            console.log("ERROR: Unable to retrieve data!", err);
        }
    });

    $("#viewUserQueries").hide();
    $("#saveUserQueries").show();
});

// Selection Dropdown
var selectDropdownWorker = function (optionsArray, selectedValue) {
    var selectDropdownFinal = "<div class='form-group'><select class='form-control input-sm'>";

    optionsArray.forEach( function(s) {
        selectDropdownFinal += "<option value='" + s + "'";
        // Add "selected" if it matches value
        if (s === selectedValue) {
            selectDropdownFinal += " selected";
        }
        // Close the first option tag
        selectDropdownFinal += ">" + s + "</option>";
    } );

    selectDropdownFinal += "</select></div>";
    return selectDropdownFinal;
};


// https://stackoverflow.com/questions/35050750/mongodb-creating-an-objectid-for-each-new-child-added-to-the-array-field
// DELETE sub object from main object

// Retrieve All Queries
$(document).on('click', '#viewAllUserQueries', function () {
    $.ajax({
        type: "get",
        url: "/searchquery/all/queries",
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            console.log("Retrieve Data from MongoDB for ALL queries table");
            console.log(data);

            // DATA - Loop thru each object
            $.each(data, function (index, object) {
                tableWorker(object);
            });
        },
        error: function (err) {
            console.log("ERROR: Unable to retrieve data!", err);
        }
    });
});


// Append to table function
var tableWorker = function (object) {
    // Setup edit action field
    var action_col = "<td><button type='button' class='btn btn-danger btn-xs delete-query' value='" + object._id + "'>Delete</button></td>";

    // Build HTML code for the table row
    var newRow = "<tr class='center'>";
    newRow += "<td>" + object._id + "</td>";
    newRow += "<td>" + object.email + "</td>";

    newRow += action_col;
    newRow += "</tr>";

    $("#savedAllUserQueries > tbody:last-child").append(newRow);
};


// Delete button click event listener
$(document).on('click', '.delete-query', function () {
    var target = $(this);
    // Send result to server for saving to object database
    if (target.val()) {
        var prep = {};
        prep.id = target.val();
        console.log("prep", prep);
        var json = JSON.stringify(prep);
        console.log('Requesting delete of ->', json);
        $.ajax({
            type: "delete",
            url: "/searchquery/del/queries",
            dataType: "json",
            data: json,
            contentType: "application/json",
            success: function(data){
                console.log("Item removed from the database!");
                target.parent().parent().addClass('hide');
            },
            error: function(err){
                console.log("ERROR: Unable remove the item from the database!", err);
            }
        });
    }
});
