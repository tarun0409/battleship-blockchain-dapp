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
    var getUrl = "/grid?gameId="+getCookie('gameId')+"&playerId="+getCookie('playerId');
    $.ajax({
        type:"GET",
        url:getUrl,
        success: function(response){
            for(var k=0; k<response.grids.length; k++)
            {
                var grid = response.grids[k].Grid;
                if(response.grids[k].Type === "ocean")
                {
                    for(var i=0; i<10; i++)
                    {
                        var trElement = document.createElement("tr");
                        for(var j=0; j<10; j++)
                        {
                            var gridCell = document.createElement("td");
                            var cellButton = document.createElement('button');
                            cellButton.classList.add('oceanCell');
                            cellButton.classList.add('btn-dark');
                            cellButton.id = String((i*10)+j);
                            cellButton.setAttribute('x',String(i));
                            cellButton.setAttribute('y',String(j));
                            var textNode = null;
                            if(grid[i][j] === 1)
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
        },
        error: function(response) {
            console.log(response.responseText);
        }
    });

});