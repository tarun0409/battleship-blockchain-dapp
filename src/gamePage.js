$(document).ready(function() {
    if(getCookie('playerId') == null || getCookie('playerId')=='null' || getCookie('playerId')==='null')
    {
        window.location.href='/login';
        return;
    }
    if(getCookie('gameId') == null || getCookie('gameId')=='null' || getCookie('gameId')==='null')
    {
        window.location.href='/';
        return;
    }
    $('#setup').click(function(){
        window.location.href='/setup';
    });
    $('#play').click(function(){
        window.location.href='/battle'
    });
});