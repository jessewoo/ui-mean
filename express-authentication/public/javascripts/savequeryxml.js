// Save Query to Sierra
$(document).ready(function () {
    // Save Query to Sierra

    $(document).on('click','#saveQueryToSierra',function(event){
        event.preventDefault();
        fetchQueryXML_DummyData();
    });
});

function fetchQueryXML_DummyData() {
    $.ajax({
        type: "get",
        url: "/data/dummy2.json",
        dataType: "json",
        contentType: "application/json",
        success: [ function (data) {

            console.log(data);

            if ( ((data["Results"]) == null ) || (typeof data["Results"][0] !== 'undefined') || ((data["Results"]).length = 0 ) ) {
                console.log("Query Results is NULL or EMPTY");
            }

            // For Composition XML - need to escape double quotes

            var queryXML = data["Query XML"];

            // Clean up the XML data
            queryXML = queryXML.replace(/<queryId>[\s\S]*?<\/queryId>/g, '');
            queryXML = queryXML.replace(/<resultCount>[\s\S]*?<\/resultCount>/g, '');
            queryXML = queryXML.replace(/<runtimeStart>[\s\S]*?<\/runtimeStart>/g, '');
            queryXML = queryXML.replace(/<runtimeMilliseconds>[\s\S]*?<\/runtimeMilliseconds>/g, '');

            console.log(queryXML);
            console.log("Post STRING to HTML 'searchxml'");

            $.post( "/searchxml", { xml: queryXML })
                .done( function(data) {
                    // console.log(data);
                    if (data.message = "stored") {
                        console.warn(data.query_xml);
                        window.location='/searchxmlpage'
                    } else {
                        console.error("Error in Storage");
                    }

                });

        }],
        error: function (err) {
            console.error(err + " - Failed to find JSON with query ID [" + QueryId + "]");
            window.location.replace("/pdb/static.do?p=resultsV2/no_result.html");
        }
    });

}

