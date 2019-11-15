$(document).ready(function(){

    $("#registerPlayer").click(function(){
        var userName = $('#userName').val();
        var publicKey = $('#publicKey').val();
        var password = $('#password').val();
        playerObj = {};
        playerObj["User_Name"] = userName;
        playerObj["Public_Key"] = publicKey;
        playerObj["Password"] = password;

        $.ajax({
            type: "POST",
            url: "/player",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(playerObj),
            success: function(response) {
                window.location.href = '/login'
            },
            error: function(response) {
                $('#userName').val('');
                $('#publicKey').val('');
                $('#password').val('');
                alert(response.responseJSON.msg);
            }
        });
    });
    $("#loginPlayer").click(function(){
        window.location.href = '/login';
    });
});