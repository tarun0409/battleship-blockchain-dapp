$(document).ready(function(){

    $("#playerLogin").click(function(){
        var userName = $('#userName').val();
        var password = $('#password').val();
        playerObj = {};
        playerObj["User_Name"] = userName;
        playerObj["Password"] = password;

        $.ajax({
            type: "POST",
            url: "/login",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(playerObj),
            success: function(response) {
                window.location.href = '/'
            },
            error: function(response) {
                $('#userName').val('');
                $('#password').val('');
                alert(response.responseJSON.msg);
            }
        });
    });
});