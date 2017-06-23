console.log("post.js");

var xmlQuery = "<orgPdbQuery><version>head</version><queryType>org.pdb.query.simple.AdvancedKeywordQuery</queryType><description>Text Search for: hiv</description><queryId>F627ECA4</queryId><resultCount>2364</resultCount><runtimeStart>2017-05-17T23:17:17Z</runtimeStart><runtimeMilliseconds>1742</runtimeMilliseconds><keywords>hiv</keywords></orgPdbQuery>";

var queryArray = {
    "search_queries" : [{
        "query_description" : "Text Search for: hiv",
        "query_xml" : "<orgPdbQuery><version>head</version><queryType>org.pdb.query.simple.AdvancedKeywordQuery</queryType><description>Text Search for: hiv</description><keywords>hiv</keywords></orgPdbQuery>"
    }, {
        "query_description" : "Text Search for: diabetes",
        "query_xml" : "<orgPdbQuery><version>head</version><queryType>org.pdb.query.simple.AdvancedKeywordQuery</queryType><description>Text Search for: diabetes</description><keywords>diabetes</keywords></orgPdbQuery>"
    }]
};

function getByValue(arr, arr_key, specific_key, specific_value) {
    var iLen = arr[arr_key].length;
    for (var i = 0; i < iLen; i++) {
        // console.log(arr[arr_key][i]);
        // console.log(arr[arr_key][i][specific_key]);
        if (arr[arr_key][i][specific_key] === specific_value) {
            return arr[arr_key][i];
        }
    }
}

console.log("Grab XML from the MongoDB Database");

$(document).on('click', '.submitRestButton', function ( event ) {

    event.preventDefault();
    var title = $(this).val();

    var result = getByValue(queryArray, "search_queries", "query_description", title);
    console.log(result["query_xml"]);

    $("#xml_text_value").val(result["query_xml"]);

    $('form').submit();

    console.warn("No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'null' is therefore not allowed access.");

    /*
    $.post( "http://localhost:8080/pdb/software/webservices/rest_two.jsp", { xml: xmlQuery })
        .done( function(data) {
            console.log(data);
        });
    */

});