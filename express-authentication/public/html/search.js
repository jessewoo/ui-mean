function submitForm(){

    var sorting = document.getElementById('sortField').value;
    var queryXML = document.getElementById('xmlText').value;

    if (queryXML.length > 0) {

        queryXML = checkComparator(queryXML);

        var xmlText = encodeURIComponent(queryXML);

        var restUrl="/pdb/rest/search/"+(sorting?"?sortfield="+sorting:"")
        document.getElementById('restUrl').innerHTML="Posted XML to: "+restUrl;

        $.post("/pdb/rest/search/?req=browser"+(sorting?"&sortfield="+sorting:""),
            xmlText,
            function (data){

                var spl = data.trim().split("\n");

                var rs=0;
                var h = "<p>";

                var qrid=null;

                var onReportPage = document.getElementById("onReportPage").value;

                //alert("onReportPage="+onReportPage);

                if (onReportPage=="n") {

                    for (var spliti = 0; spliti < spl.length; spliti++){
                        var it = spl[spliti].replace(/[\n\t\r]/g,"");

                        if (it.length<4)
                        {
                            h+='<a href="/pdb/ligand/ligandsummary.do?hetId='+it+'">'+it+'</a> '
                            rs++;
                        } else if (it.length==4) {
                            h+='<a href="/pdb/explore.do?structureId='+it+'">'+it+'</a> ';
                            rs++;
                        } else if ((it.length>4)&&(it.indexOf(".")>0))
                        {
                            h+='<a href="/pdb/explore/remediatedSequence.do?structureId='+it.substring(0,4)+'&params.chainEntityStrategyStr=all&forcePageForChain='+it.substring(5)+'">'+it+'</a> ';
                            rs++;
                        } else if ((it.length>4)&&(it.indexOf(":")>0))
                        {
                            h+='<a href="/pdb/explore/remediatedSequence.do?structureId='+it.substring(0,4)+'">'+it+'</a> ';
                            rs++;
                        }
                        else if(it.length>4 && spliti>0 && rs>0) {
                            h+='<br/><br/><a href="/pdb/results/results.do?qrid='+it+'">View results</a> ';
                            qrid=it;
                        }
                    }
                    h+="</p>";
                    h="<p>"+rs+" results</p>"+h;
                }
                else {

                    h="";
                    for (var spliti = 0; spliti < spl.length; spliti++) {
                        var it = spl[spliti].replace(/[\n\t\r]/g,"");

                        if ((h.length > 0) && (it.length <= 4)) {
                            h+=",";
                        }
                        if ((h.length > 0) && (it.length > 4) && ((it.indexOf(".")>0)||(it.indexOf(":")>0))) {
                            h+=",";
                        }
                        if ((it.length == 4)||(it.indexOf(".")>0)||(it.indexOf(":")>0)) {
                            h+=it;
                        }
                        else if (it.length > 4)
                        {
                            qrid=it;
                        }
                    }
                }

                $('#restResults').html(h);
                document.getElementById('qridHidden').value=qrid;
            }
        );
    }
    else
    {
        alert("Please enter a query in the text box.");
    }
    return false;

}

function checkComparator(queryXML) {

    while (queryXML.indexOf(".comparator=< ")>-1) {
        queryXML = queryXML.replace(".comparator=< ", ".comparator=<![CDATA[<]]>");
    }

    while (queryXML.indexOf(".comparator><<")>-1) {
        queryXML = queryXML.replace(".comparator><<", ".comparator><![CDATA[<]]><");
    }

    while (queryXML.indexOf(".comparator=> ")>-1) {
        queryXML = queryXML.replace(".comparator=> ", ".comparator=<![CDATA[>]]>");
    }

    while (queryXML.indexOf(".comparator>><")>-1) {
        queryXML = queryXML.replace(".comparator>><", ".comparator><![CDATA[>]]><");
    }
    return queryXML;

}