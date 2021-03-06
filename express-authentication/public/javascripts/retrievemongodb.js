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


$(document).on('click', '.emailUserButton', function ( event ) {
    event.preventDefault();
    console.log("emailUserButton CLICKED");
    var xmlText = $(this).attr("alt");
    // console.log(xmlText);

    var queryDescription = $(this).parents().eq(1).find(".queryDescription span small").html();

    var finalXmlText;

    // Figure out how to get the Tuesday from a month back, or a week back
    var addTimeBoundConjunction = "<queryRefinement><conjunctionType>and</conjunctionType><orgPdbQuery><queryType>org.pdb.query.simple.ReleaseDateQuery</queryType><pdbx_audit_revision_history.revision_date.comparator>between</pdbx_audit_revision_history.revision_date.comparator><pdbx_audit_revision_history.revision_date.min>2017-07-01</pdbx_audit_revision_history.revision_date.min><pdbx_audit_revision_history.revision_date.max>2017-07-31</pdbx_audit_revision_history.revision_date.max><pdbx_audit_revision_history.ordinal.comparator>=</pdbx_audit_revision_history.ordinal.comparator><pdbx_audit_revision_history.ordinal.value>1</pdbx_audit_revision_history.ordinal.value></orgPdbQuery></queryRefinement></orgPdbCompositeQuery>";

    if (xmlText.includes("orgPdbCompositeQuery")) {
        finalXmlText = xmlText.replace(/<version>[\s\S]*?<\/version>/g, '');
        finalXmlText = finalXmlText.replace(/<queryRefinementLevel>[\s\S]*?<\/queryRefinementLevel>/g, '');
        finalXmlText = finalXmlText.replace("</orgPdbCompositeQuery>", "");
        finalXmlText += addTimeBoundConjunction;
    } else {
        finalXmlText = "<orgPdbCompositeQuery>";
        finalXmlText += "<queryRefinement>" + xmlText + "</queryRefinement>";
        finalXmlText += addTimeBoundConjunction;
    }

    finalXmlText = encodeURIComponent(finalXmlText);

    var structureDataArray = [];

    $.ajax({
        type: "POST",
        url: "http://jwdev.rcsb.org/pdb/rest/search/",
        data: finalXmlText,
        success: function(data) {
            if ((data === "") || (data === null)) {
                console.log("No Data");
            } else {
                structureDataArray = data.trim().split("\n");
                // console.log(structureDataArray);
                emailStructureData(structureDataArray, queryDescription);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Error, status = " + textStatus + ", " +
                "error thrown: " + errorThrown
            );
        }
    });
});

// Function Email

// Because forEach accept only one callback.
// Since there is asynchronous method inside forEach, need to check whether all asyn call completed
function emailStructureData(structureDataArray, queryDescription) {
    console.log("Email Structure Data Function");
    console.log(structureDataArray);

    var emailStructure = "";

    $.each(structureDataArray, function (index) {
        var pdbid = structureDataArray[index];
        var structureDataArrayLength = structureDataArray.length;
        $.ajax({
            type: "GET",
            url: "http://jwdev.rcsb.org/pdb/json/describePDB?structureId=" + pdbid,
            data: {format: 'json'},
            success: function(data) {
                var dataParsed = JSON.parse(data);
                var structureTitle = dataParsed[0]["title"];
                emailStructure += "Structure ID: " + pdbid + " | Title: " + structureTitle + "\n";

                if ((index + 1) === structureDataArrayLength) {
                    // console.log(emailStructure);
                    emailToUser(emailStructure, queryDescription);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert("Error, status = " + textStatus + ", " +
                    "error thrown: " + errorThrown
                );
            }
        });
    });
}

// Function Email
function emailToUser(finalEmailStructure, queryDescription) {
    console.log("Email to User");
    console.log(finalEmailStructure);
    console.log(queryDescription);

    var preferred_email = $('#preferred_email_value').val();

    $.ajax({
        url: "/email/contact",
        method: "POST",
        data: { email: preferred_email, subject: queryDescription, message: finalEmailStructure },
        success: function(response) {
            console.log(response);
            console.log("DONE POST");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Error, status = " + textStatus + ", " +
                "error thrown: " + errorThrown
            );
        }
    });
}


$(document).on('click', '.deleteUserOneQuery', function ( event ) {
    event.preventDefault();
    $(this).parents().eq(1).remove();
    console.log("Table Rows Remaining: " + $("#savedUserQueries tbody tr").length);
    var mongoId = $("#mongoIdForCollection").html();
    updateUserQueries(mongoId);
});

// Escaping HTML special characters
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

$(document).on('click', '.editQueryDescription', function ( event ) {
    event.preventDefault();
    $(this).parents().eq(0).find(".saveUserQueryButton").removeClass("hide");
    $(this).parents().eq(0).find(".cancelUserQueryButton").removeClass("hide");

    $(this).parents().eq(1).find(".queryDescription").removeClass("inactive");
    $(this).parents().eq(1).find(".queryDescription").addClass("active");

    $(this).parents().eq(1).find(".editQueryDescription").css("display","none");
    $(this).parents().eq(1).find(".queryDescription span").css("display","none");
    $(this).parents().eq(1).find(".queryDescription input").css("display","block");

    console.log("Current Value: " + $(this).parents().eq(1).find(".queryDescription input").val());
});

$(document).on('click', '.cancelUserQueryButton', function ( event ) {
    event.preventDefault();

    $(this).addClass("hide");
    $(this).parents().eq(0).find(".saveUserQueryButton").addClass("hide");

    $(this).parents().eq(1).find(".queryDescription").removeClass("active");
    $(this).parents().eq(1).find(".queryDescription").addClass("inactive");

    var originalValue = $(this).parents().eq(1).find(".queryDescription input").attr("value");

    $(this).parents().eq(1).find(".queryDescription span small").html(originalValue);
    $(this).parents().eq(1).find(".queryDescription input").val(originalValue);

    $(this).parents().eq(1).find(".queryDescription span").css("display","inline");
    $(this).parents().eq(1).find(".queryDescription input").css("display","none");
    $(this).parents().eq(1).find(".editQueryDescription").removeAttr('style');

});


// TD cell mouse enter and leaving
$(document).on('mouseenter', '.queryDescription', function() {
    $(this).parents().eq(0).find(".editQueryDescription").removeClass("hide");
});
$(document).on('mouseleave', '.queryDescription', function() {
    $(this).parents().eq(0).find(".editQueryDescription").addClass("hide");
});


// QUERY DESCRIPTION
$(document).on('click', '.saveUserQueryButton', function ( event ) {
    event.preventDefault();
    $(this).addClass("hide");
    $(this).parents().eq(0).find(".cancelUserQueryButton").addClass("hide");

    $(this).parents().eq(1).find(".queryDescription").removeClass("active");
    $(this).parents().eq(1).find(".queryDescription").addClass("inactive");

    var updatedInputValue = $(this).parents().eq(1).find(".queryDescription input").val();
    $(this).parents().eq(1).find(".queryDescription span small").html(updatedInputValue);
    $(this).parents().eq(1).find(".queryDescription input").val(updatedInputValue);

    $(this).parents().eq(1).find(".queryDescription span").css("display","inline");
    $(this).parents().eq(1).find(".queryDescription input").css("display","none");
    $(this).parents().eq(1).find(".editQueryDescription").removeAttr('style');


});

// Save ALL QUERIES BUTTON
$(document).on('click', '#saveUserQueries', function ( event ) {
    event.preventDefault();

    console.log("saveUserQueries Button pressed");

    var mongoId = $("#mongoIdForCollection").html();
    updateUserQueries(mongoId);

});

// Selection Dropdown
$(document).on('change', '#savedUserQueries select', function ( event ) {
    event.preventDefault();
    // Check the option value selected
    console.log("Table Rows Remaining: " + $("#savedUserQueries tbody tr").length + " | '" + $(this).parents().eq(1).attr('class') + "' Cell - Selection Option: " + $(this).val());
    var mongoId = $("#mongoIdForCollection").html();
    updateUserQueries(mongoId);
});


// Take the Table, update the search query array
var updateUserQueries = function (old_mongodb_id) {
    var user_email = $('#user_email').html();
    var preferred_email = $('#preferred_email_value').val();

    console.log(old_mongodb_id);
    console.log(preferred_email);

    var finalObject = new Object();
    var updatedUserQueriesArray = [];

    $('#savedUserQueries tbody tr').each(function(){
        var oneQuery = new Object();
        oneQuery.next_scheduled_run = $(this).find('.scheduledRunCell select :selected').text();
        oneQuery.email_notification = $(this).find('.emailNotifyCell select :selected').text();
        oneQuery.query_description = $(this).find('.queryDescription span small').html();
        oneQuery.query_xml = $(this).find('td .submitRestButton').attr("alt");
        updatedUserQueriesArray.push(oneQuery);
    });

    finalObject.email = user_email;
    finalObject.preferred_email = preferred_email;

    finalObject.search_queries = JSON.stringify(updatedUserQueriesArray);
    console.log(finalObject);

    $.ajax({
        type: "POST",
        url: "/searchquery/one/queries/update/" + old_mongodb_id,
        data: finalObject,
        dataType: "json",
        success: function (data) {
            console.log(data);
            console.log("Item updated to database!");
        },
        error: function (err) {
            console.log("ERROR: Unable save the item to the database!", err);
        }
    });

};


$(document).on('click', '#viewUserQueries', function () {
    var user_email = $('#user_email').html();
    console.log(user_email);

    // url: "/searchquery/one/queries/email/" + user_email
    $.ajax({
        type: "get",
        url: "/searchquery/one/queries/user/all",
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            console.log("Retrieve Data from MongoDB for searchQueries table");
            console.log(data);

            $("#mongoIdForCollection").html(data[0]["_id"]);
            $("#preferred_email_value").val(data[0]["preferred_email"]);

            // DATA - Loop thru each object
            $.each(data[0]["search_queries"], function (index, object) {
                // Build HTML code for the table row

                var queryDescription = escapeHtml(object["query_description"]);

                var newRow = "<tr>";
                newRow += "<td class='scheduledRunCell col-xs-2'>" + selectDropdownWorker(["monthly","weekly","none"],object["next_scheduled_run"]) + "</td>";
                newRow += "<td class='emailNotifyCell col-xs-2'>" + selectDropdownWorker(["true","false"],object["email_notification"]) + "</td>";
                newRow += "<td class='queryDescription col-xs-5 editable-field inactive'>" +
                    "<span><small>" + queryDescription + "</small></span>" +
                    "<button class='btn btn-default btn-sm editQueryDescription hide' type='submit'><span class='glyphicon glyphicon-pencil'></span></button>" +
                    "<input class='form-control input-sm' type='text' style='display: none;' value='" + queryDescription + "'>" +
                    "<button class='btn btn-success btn-sm saveUserQueryButton hide' type='submit'>SAVE</button>"  +
                    "<button class='btn btn-default btn-sm cancelUserQueryButton hide' type='submit'>CANCEL</button>"  +
                    "</td>";
                newRow += "<td class='col-xs-2'><input class='btn btn-primary btn-sm submitRestButton' type='submit' value='Search' alt='" + object["query_xml"].toString() + "'><button class='btn btn-danger btn-sm deleteUserOneQuery' type='submit'><span class='glyphicon glyphicon-trash'></span></button></td>";
                newRow += "<td class='col-xs-1'><input class='btn btn-default btn-sm emailUserButton' type='submit' value='Email' alt='" + object["query_xml"].toString() + "'></td>";
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
