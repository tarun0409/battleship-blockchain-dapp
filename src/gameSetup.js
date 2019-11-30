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
    
    buttonClicked = false;
    clickedButton = null;
    numShipConfigured = 0;
    var shipsConfigured = {};
    shipsConfigured.carrier = false;
    shipsConfigured.battleship = false;
    shipsConfigured.cruiser = false;
    shipsConfigured.submarine = false;
    shipsConfigured.destroyer = false;
    gridObj = {};
    gridObj.Type="ocean";
    matrix = null;
    $("#selectItems").hide();
    for(var i=0; i<10; i++)
    {
        var trElement = document.createElement("tr");
        for(var j=0; j<10; j++)
        {
            var gridCell = document.createElement("td");
            var cellButton = document.createElement('button');
            cellButton.classList.add('gridCell');
            cellButton.classList.add('btn-dark');
            cellButton.id = String((i*10)+j);
            cellButton.setAttribute('x',String(i));
            cellButton.setAttribute('y',String(j));
            gridCell.appendChild(cellButton);
            trElement.appendChild(gridCell);
        }
        document.getElementById('grid').appendChild(trElement);
    }
    $('#grid').on('click', '.gridCell', function() {
        if(!buttonClicked)
        {
            buttonClicked = true;
            clickedButton = this;
            $(this).removeClass('btn-dark');
            $(this).addClass('btn-light');
            $("#selectItems").show();
        }
    });
    $('#cancelSelect').click(function(){
        buttonClicked = false;
        $(clickedButton).removeClass('btn-light');
        $(clickedButton).addClass('btn-dark');
        $("#selectItems").hide();
        clickedButton = null;
    });
    $('#setShip').click(function(){
        var ship = $('#shipSelect').val();
        if(shipsConfigured[ship] || numShipConfigured >= 5)
        {
            buttonClicked = false;
            $(clickedButton).removeClass('btn-light');
            $(clickedButton).addClass('btn-dark');
            $("#selectItems").hide();
            clickedButton = null;
            return;
        }
        var orient = $("input[name='orientation']:checked").val();
        var shipToSize = {};
        shipToSize.carrier = 5;
        shipToSize.battleship = 4;
        shipToSize.cruiser = 3;
        shipToSize.submarine = 3;
        shipToSize.destroyer = 2;
        var shipToNotation = {};
        shipToNotation.carrier = 'C';
        shipToNotation.battleship = 'B';
        shipToNotation.cruiser = 'R';
        shipToNotation.submarine = 'S';
        shipToNotation.destroyer = 'D';
        var shipSize = shipToSize[ship];
        var shipNotation = shipToNotation[ship];
        var x = parseInt($(clickedButton).attr('x'));
        var y = parseInt($(clickedButton).attr('y'));
        if((x+shipSize >= 10 && orient==="vertical") || (y+shipSize>=10 && orient==="horizontal"))
        {
            buttonClicked = false;
            $(clickedButton).removeClass('btn-light');
            $(clickedButton).addClass('btn-dark');
            $("#selectItems").hide();
            clickedButton = null;
            alert("Ship goes out of board. Reorient it");
        }
        else
        {
            $(clickedButton).removeClass('btn-light');
            $(clickedButton).addClass('btn-dark');
            var shipObj = {}
            shipObj.start = [x,y];
            shipObj.orientation = orient;
            if(ship === "carrier")
            {
                gridObj.Carrier = shipObj;
            }
            else if(ship === "battleship")
            {
                gridObj.Battleship = shipObj;
            }
            else if(ship === "cruiser")
            {
                gridObj.Cruiser = shipObj;
            }
            else if(ship === "submarine")
            {
                gridObj.Submarine = shipObj;
            }
            else if(ship === "destroyer")
            {
                gridObj.Destroyer = shipObj;
            }
            if(orient==="vertical")
            {
                for(var i=x; i<(x+shipSize); i++)
                {
                    bid = "#"+String((i*10)+y);
                    $(bid).append(shipNotation);
                }    
            }
            else
            {
                for(var i=y; i<(y+shipSize); i++)
                {
                    bid = "#"+String((x*10)+i);
                    $(bid).append(shipNotation);
                }  
            }
            buttonClicked = false;
            clickedButton = null;
            $("#selectItems").hide();
            shipsConfigured[ship] = true;
            numShipConfigured++;
        }
    });
    $("#finishConfigure").click(function(){
        if(numShipConfigured < 5)
        {
            alert("Please configure all the ships before proceeding");
            return;
        }
        var nonce = $("#nonce").val();
        if(nonce==="")
        {
            alert("Please enter a nonce");
            return;
        }
        // gridObj.Public_Key = getCookie('publicKey');
        // gridObj.nonce = nonce;
        var postUrl = "/grid?gameId="+getCookie('gameId')+"&playerId="+getCookie('playerId');
        $.ajax({
            type: "POST",
            url: postUrl,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(gridObj),
            success: function(response) {
                matrix = response.data[0].Grid;
                tGridObj = {};
                tGridObj.Type = "target";
                $.ajax({
                    type: "POST",
                    url: postUrl,
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(tGridObj),
                    success: function(response) {
                        var gridStr = "";
                        for(var i=0; i<10; i++)
                        {
                            for(var j=0; j<10; j++)
                            {
                                gridStr += matrix[i][j];
                            }
                        }
                        var bGameId = web3.fromAscii(getCookie('gameId'));
                        var boardHash = web3.sha3(nonce+gridStr);
                        // var one_ether = web3.toWei("1");
                        web3.eth.getCoinbase(function(err,res){
                            var fromObj = {};
                            fromObj.from = res;
                            fromObj.value = 100000000000000;
                            Battleship.deployed().then((instance) => {
                                instance.joinGame(bGameId, boardHash, fromObj).then(() => {
                                    window.location.href = '/play';
                                }).catch((err) => {
                                    console.log(err);
                                });
                            });
                        });
                    },
                    error: function(response) {
                        alert(response.responseJSON.msg);
                    }
                });
            },
            error: function(response) {
                alert(response.responseJSON.msg);
            }
        });
    });
});