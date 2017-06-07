$(function () {
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
            },
            error: function (err) {
                console.log("ERROR: Unable to retrieve data!", err);
            }
        });
    });

});

