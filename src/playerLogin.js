$(document).ready(function(){

    if(getCookie('playerId') != null && getCookie('playerId')!='null' && getCookie('playerId')!=='null')
    {
        window.location.href='/';
        return;
    }
    $("#playerLogin").click(function(){
        var userName = $('#userName').val();
        var password = $('#password').val();
        var playerObj = {};
        playerObj["User_Name"] = userName;
        playerObj["Password"] = password;

        $.ajax({
            type: "POST",
            url: "/login",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(playerObj),
            success: function(response) {
                setCookie('playerId',response.id);
                window.location.href = '/'
            },
            error: function(response) {
                $('#userName').val('');
                $('#password').val('');
                alert(response.responseJSON.msg);
            }
        });
    });
    $("#playerRegister").click(function(){
        window.location.href = '/register';
    });
});