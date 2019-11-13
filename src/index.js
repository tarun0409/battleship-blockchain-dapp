$(document).ready(function(){
    $.ajax({
        type:"GET",
        url:"/game",
        success: function(response){
            games = response.games;
            for(var i=0; i<games.length; i++)
            {
                var trElement = document.createElement("tr");
                trElement.classList.add("clickable-row");
                var gameNameTd = document.createElement("td");
                gameNameTd.classList.add("text-center");
                var gameNameText = document.createTextNode(games[i].Name);
                gameNameTd.appendChild(gameNameText);
                trElement.appendChild(gameNameTd);
                var playersJoinedTd = document.createElement("td");
                playersJoinedTd.classList.add("text-center");
                var playersJoinedText = document.createTextNode(games[i].Players_Joined);
                playersJoinedTd.appendChild(playersJoinedText);
                trElement.appendChild(playersJoinedTd);
                if(games[i].Winner)
                {
                    var winnerTd = document.createElement("td");
                    winnerTd.classList.add("text-center");
                    var winnerText = document.createTextNode(games[i].Winner);
                    winnerTd.appendChild(winnerText);
                    trElement.appendChild(winnerTd);
                }
                document.getElementById("gameTable").appendChild(trElement);
            }
        },
        error: function(response) {
            console.log(response.responseText);
        }
    });
    $("#createGame").click(function(){
        var gameName = $('#gameName').val();
        gameObj = {};
        gameObj["Name"] = gameName;

        $.ajax({
            type: "POST",
            url: "/game",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(gameObj),
            success: function(response) {
                alert("Game created");
                console.log(response);
            },
            error: function(response) {
                console.log(response.responseText);
            }
    });

        // $.post("/elections", electionObj,  function(data, status){
        //     console.log(status);
        //     console.log(data);
        // });
    });
});