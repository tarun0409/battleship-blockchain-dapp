$(document).ready(function(){
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
    clickedButton = null;
    var getUrl = "/grid?gameId="+getCookie('gameId')+"&playerId="+getCookie('playerId');
    $.ajax({
        type:"GET",
        url:getUrl,
        success: function(response){
            var allGrids = response.grids;
            var moveGet = "/game/"+getCookie('gameId')+"/move?playerId="+getCookie('playerId');
            $.ajax({
                type:"GET",
                url:moveGet,
                success: function(response){
                    var attack_i = -1;
                    var attack_j = -1;
                    moves = response.moves;
                    oppSunkenShips = response.opponent_sunken_ships;
                    if(moves.length > 0 && !moves[moves.length-1].effect && response.defender === getCookie('playerId'))
                    {
                        attack_i = moves[moves.length-1].attack[0];
                        attack_j = moves[moves.length-1].attack[1];
                    }
                    for(var k=0; k<allGrids.length; k++)
                    {
                        var grid = allGrids[k].Grid;
                        if(allGrids[k].Type === "ocean")
                        {
                            for(var i=0; i<10; i++)
                            {
                                var trElement = document.createElement("tr");
                                for(var j=0; j<10; j++)
                                {
                                    var gridCell = document.createElement("td");
                                    var cellButton = document.createElement('button');
                                    cellButton.classList.add('oceanCell');
                                    if(attack_i===i && attack_j===j)
                                    {
                                        cellButton.classList.add('btn-danger');
                                    }
                                    else
                                    {
                                        cellButton.classList.add('btn-dark');
                                    }
                                    cellButton.id = String((i*10)+j);
                                    cellButton.setAttribute('x',String(i));
                                    cellButton.setAttribute('y',String(j));
                                    var textNode = null;
                                    if(grid[i][j] === -1)
                                    {
                                        textNode = document.createTextNode('X');
                                    }
                                    else if(grid[i][j] === 1)
                                    {
                                        textNode = document.createTextNode('C');
                                    }
                                    else if(grid[i][j] === 2)
                                    {
                                        textNode = document.createTextNode('B');
                                    }
                                    else if(grid[i][j] === 3)
                                    {
                                        textNode = document.createTextNode('R');
                                    }
                                    else if(grid[i][j] === 4)
                                    {
                                        textNode = document.createTextNode('S');
                                    }
                                    else if(grid[i][j] === 5)
                                    {
                                        textNode = document.createTextNode('D');
                                    }
                                    if(textNode != null)
                                    {
                                        cellButton.appendChild(textNode);
                                    }
                                    gridCell.appendChild(cellButton);
                                    trElement.appendChild(gridCell);
                                }
                                document.getElementById('ocean').appendChild(trElement);
                            }
                        }
                        else
                        {
                            for(var i=0; i<10; i++)
                            {
                                var trElement = document.createElement("tr");
                                for(var j=0; j<10; j++)
                                {
                                    var gridCell = document.createElement("td");
                                    var cellButton = document.createElement('button');
                                    cellButton.classList.add('targetCell');
                                    cellButton.classList.add('btn-dark');
                                    cellButton.id = String((i*10)+j);
                                    cellButton.setAttribute('x',String(i));
                                    cellButton.setAttribute('y',String(j));
                                    var textNode = null;
                                    if(grid[i][j] === 1)
                                    {
                                        textNode = document.createTextNode('H');
                                    }
                                    else if(grid[i][j] === -1)
                                    {
                                        textNode = document.createTextNode('M');
                                    }
                                    else if(grid[i][j] === 2)
                                    {
                                        textNode = document.createTextNode('X');
                                    }
                                    if(textNode != null)
                                    {
                                        cellButton.appendChild(textNode);
                                    }
                                    gridCell.appendChild(cellButton);
                                    trElement.appendChild(gridCell);
                                }
                                document.getElementById('target').appendChild(trElement);
                            }
                        }
                    }
                    for(var p = moves.length-1; p>=0; p--)
                    {
                        var trElement = document.createElement("tr");
                        var row = moves[p].attack[0] + 65;
                        var tdText = String.fromCharCode(row)
                        tdText += " "+String(moves[p].attack[1]+1);
                        var tdElement1 = document.createElement("td");
                        var attackNode = document.createTextNode(tdText);
                        tdElement1.classList.add('text-center');
                        tdElement1.appendChild(attackNode);
                        trElement.appendChild(tdElement1);
                        if(moves[p].effect)
                        {
                            var tdElement2 = document.createElement("td");
                            tdElement2.classList.add('text-center');
                            var effectNode = document.createTextNode(moves[p].effect);
                            tdElement2.appendChild(effectNode);
                            trElement.appendChild(tdElement2);
                        }
                        document.getElementById('moveTable').appendChild(trElement);
                    }

                },
                error: function(response) {
                    console.log(response.responseText);
                }
            });
        },
        error: function(response) {
            console.log(response.responseText);
        }
    });

    $('#target').on('click', '.targetCell', function() {
        if(clickedButton != null)
        {
            $(clickedButton).removeClass('btn-light');
            $(clickedButton).addClass('btn-dark');
        }
        clickedButton = this;
        $(this).removeClass('btn-dark');
        $(this).addClass('btn-light');
    });

    $("#attack").click(function(){
        if(clickedButton == null) return;
        var attackUrl = "/game/"+getCookie('gameId')+"/attack?playerId="+getCookie('playerId');
        var x = $(clickedButton).attr('x');
        var y = $(clickedButton).attr('y');
        attackUrl+="&row="+x+"&column="+y;
        $.ajax({
            type: "POST",
            url: attackUrl,
            success: function(response) {
                $(clickedButton).empty();
                $(clickedButton).append("X");
                $(clickedButton).removeClass('btn-light');
                $(clickedButton).addClass('btn-dark'); 
            },
            error: function(response) {
                alert(response.responseJSON.msg);
                $(clickedButton).removeClass('btn-light');
                $(clickedButton).addClass('btn-dark');
                clickedButton = null;
            }
        });
        
    });
    $("#hit").click(function(){
        var hitUrl = "/game/"+getCookie('gameId')+"/effect/hit?playerId="+getCookie('playerId');
        $.ajax({
            type: "POST",
            url: hitUrl,
            success: function(response) {
                window.location.href = '/battle';
            },
            error: function(response) {
                alert(response.responseJSON.msg);
            }
        });
    });
    $("#miss").click(function(){
        var hitUrl = "/game/"+getCookie('gameId')+"/effect/miss?playerId="+getCookie('playerId');
        $.ajax({
            type: "POST",
            url: hitUrl,
            success: function(response) {
                window.location.href = '/battle';
            },
            error: function(response) {
                alert(response.responseJSON.msg);
            }
        });
    });
    $("#sinkShipButton").click(function(){
        var sinkUrl = "/game/"+getCookie('gameId')+"/announce_sink/"+$("#shipSelect").val()+"?playerId="+getCookie('playerId');
        $.ajax({
            type: "POST",
            url: sinkUrl,
            success: function(response) {
                window.location.href = '/battle';
            },
            error: function(response) {
                alert(response.responseJSON.msg);
            }
        });

    });
});