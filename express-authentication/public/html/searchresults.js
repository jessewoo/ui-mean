console.log("searchresults.js");

// Save Query to Sierra MyPDB
$(document).ready(function () {

    // Save Query to Sierra
    $(document).on('click','#saveQueryToSierra',function(event){
        event.preventDefault();

        fetchQueryXML_DummyData();

        $('form').submit();
    });
});

var dummyData = "<orgPdbQuery><version>head</version><queryType>org.pdb.query.simple.AdvancedKeywordQuery</queryType><description>Text Search for: hiv</description><queryId>F627ECA4</queryId><resultCount>2364</resultCount><runtimeStart>2017-05-17T23:17:17Z</runtimeStart><runtimeMilliseconds>1742</runtimeMilliseconds><keywords>hiv</keywords></orgPdbQuery>";

function fetchQueryXML_DummyData() {
    $("#xml_text_search_results").val(dummyData);
}