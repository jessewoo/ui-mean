console.log("post.js");

var queryArray = {
    "search_queries" : [{
        "query_description" : "Text Search for: hiv",
        "query_xml" : "<orgPdbQuery><version>head</version><queryType>org.pdb.query.simple.AdvancedKeywordQuery</queryType><description>Text Search for: hiv</description><keywords>hiv</keywords></orgPdbQuery>"
    }, {
        "query_description" : "Text Search for: diabetes",
        "query_xml" : "<orgPdbQuery><version>head</version><queryType>org.pdb.query.simple.AdvancedKeywordQuery</queryType><description>Text Search for: diabetes</description><keywords>diabetes</keywords></orgPdbQuery>"
    }, {
        "query_description" : "Text Search for: virus",
        "query_xml" : "<orgPdbQuery><version>head</version><queryType>org.pdb.query.simple.AdvancedKeywordQuery</queryType><description>Text Search for: virus</description><keywords>virus</keywords></orgPdbQuery>"
    }]
};

// Could use MongoDB ID or the title
function getByValue(arr, arr_key, specific_key, specific_value) {
    console.log("Grab XML from the MongoDB Database");
    var iLen = arr[arr_key].length;
    for (var i = 0; i < iLen; i++) {
        console.log(arr[arr_key][i]);
        console.log(arr[arr_key][i][specific_key]);
        if (arr[arr_key][i][specific_key] === specific_value) {
            return arr[arr_key][i];
        }
    }
}


$(document).on('click', '.submitRestButton', function ( event ) {

    event.preventDefault();
    var title = $(this).val();

    // Get the query_xml from the query array
    var result = getByValue(queryArray, "search_queries", "query_description", title);
    console.log(result["query_xml"]);

    $("#xml_text_value").val(result["query_xml"]);
    $('form').submit();

    // console.warn("No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'null' is therefore not allowed access.");

});