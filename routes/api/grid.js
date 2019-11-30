const express = require('express');
const router = express.Router();
ObjectId = require('mongodb').ObjectID;
Grid = require('../../models/Grid.model');
Player = require('../../models/Player.model');
Game = require('../../models/Game.model');
// BlockchainApp = require('../../utils/blockchain');

router.get('/',(req,res) => {
    if(!req.query.playerId)
    {
        return res.status(400).json({msg:"Query field to be included: playerId", query:req.query});
    }
    if(!req.query.gameId)
    {
        return res.status(400).json({msg:"Query field to be included: gameId", query:req.query});
    }
    var playerId = ObjectId(req.query.playerId);
    var gameId = ObjectId(req.query.gameId);
    var playerQuery = {};
    playerQuery._id = playerId;
    var gameQuery = {};
    gameQuery._id = gameId;
    Player.find(playerQuery).then((players) => {
        if(players.length === 0)
        {
            return res.status(400).json({msg:"Invalid player ID", query:req.query.playerId});
        }
        Game.find(gameQuery).then((games) => {
            if(games.length === 0)
            {
                return res.status(400).json({msg:"Invalid game ID", input:req.params.gameId});
            }
            var gridQuery = {};
            var gridIds = Array();
            if(String(games[0].Player_One) === String(playerId))
            {
                gridIds.push(games[0].Player_One_Ocean_Grid);
                gridIds.push(games[0].Player_One_Target_Grid);
            }
            else if(String(games[0].Player_Two) === String(playerId))
            {
                gridIds.push(games[0].Player_Two_Ocean_Grid);
                gridIds.push(games[0].Player_Two_Target_Grid);
            }
            var inSubQuery = {};
            inSubQuery["$in"] = gridIds;
            gridQuery._id = inSubQuery;
            Grid.find(gridQuery).then((grids) => {
                if(grids.length === 0)
                {
                    return res.status(204).json({grids:[]});
                }
                res.status(200).json({grids});
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({msg:"Problem with fetching grids from the database"});
            });
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Problem with fetching games from the database"});
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching players from the database"});
    });
});

router.get('/original/string', (req,res) => {
    if(!req.query.playerId)
    {
        return res.status(400).json({msg:"Query field to be included: playerId", query:req.query});
    }
    if(!req.query.gameId)
    {
        return res.status(400).json({msg:"Query field to be included: gameId", query:req.query});
    }
    var playerId = ObjectId(req.query.playerId);
    var gameId = ObjectId(req.query.gameId);
    var playerQuery = {};
    playerQuery._id = playerId;
    var gameQuery = {};
    gameQuery._id = gameId;
    Player.find(playerQuery).then((players) => {
        if(players.length === 0)
        {
            return res.status(400).json({msg:"Invalid player ID", query:req.query.playerId});
        }
        Game.find(gameQuery).then((games) => {
            if(games.length === 0)
            {
                return res.status(400).json({msg:"Invalid game ID", input:req.params.gameId});
            }
            var gridQuery = {};
            if(String(games[0].Player_One) === String(playerId))
            {
                gridQuery._id = games[0].Player_One_Original_Grid;
            }
            else if(String(games[0].Player_Two) === String(playerId))
            {
                gridQuery._id = games[0].Player_Two_Original_Grid;
            }
            Grid.find(gridQuery).then((grids) => {
                if(grids.length === 0)
                {
                    return res.status(204).json({grids:[]});
                }
                var gridString = "";
                for(var i=0; i<10; i++)
                {
                    for(var j=0; j<10; j++)
                    {
                        gridString += grids[0].Grid[i][j];
                    }
                }
                res.status(200).json({grid_string:gridString});
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({msg:"Problem with fetching grids from the database"});
            });
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Problem with fetching games from the database"});
        });;
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching players from the database"});
    });;
});

router.post('/',(req,res) => {
    if(!req.body)
    {
        return res.status(400).json({msg:"Invalid format.", input:req.body});
    }
    if(!req.query.gameId)
    {
        return res.status(400).json({msg:"Query field to be included: gameId", query:req.query});
    }
    if(!req.query.playerId)
    {
        return res.status(400).json({msg:"Query field to be included: playerId", query:req.query});
    }
    if(!req.body.Carrier || !req.body.Battleship || !req.body.Cruiser || !req.body.Submarine || !req.body.Destroyer)
    {
        return res.status(400).json({msg:"One or more of the battleships have not been set", input:req.body});
    }
    var playerId = ObjectId(req.query.playerId);
    var gameId = ObjectId(req.query.gameId);
    var playerQuery = {};
    playerQuery._id = playerId;
    var gameQuery = {};
    gameQuery._id = gameId;
    Player.find(playerQuery).then((players) => {
        if(players.length === 0)
        {
            return res.status(400).json({msg:"Invalid player ID", input:req.params.playerId});
        }
        Game.find(gameQuery).then((games) => {
            if(games.length === 0)
            {
                return res.status(400).json({msg:"Invalid game ID", input:req.params.gameId});
            }
            var grids = Array();
            var targetGrid = {};
            var oceanGrid = {};
            var duplicateGrid = {};
            targetGrid.Type = "target";
            oceanGrid.Type = "ocean";
            duplicateGrid.Type = "ocean";
            theGrid = Array();
            for(var i=0; i<10; i++)
            {
                row = Array();
                for(var j=0; j<10; j++)
                {
                    row.push(0);
                }
                theGrid.push(row);
            }
            targetGrid.Grid = Array();
            for(var i=0; i<10; i++)
            {
                targetGrid.Grid.push(theGrid[i].slice());
            }
            var tGridObj = new Grid(targetGrid);
            grids.push(tGridObj);
            var ships = ["Carrier","Battleship","Cruiser","Submarine","Destroyer"];
            var ship_to_size = {"Carrier":5,"Battleship":4,"Cruiser":3,"Submarine":3,"Destroyer":2};
            for(var k=0; k<ships.length; k++)
            {
                ship = ships[k];
                shipObj = req.body[ship];
                var end_i = (shipObj.orientation === "vertical")?(shipObj.start[0]+ship_to_size[ship]):shipObj.start[0]+1;
                if(end_i > theGrid.length)
                {
                    return res.status(400).json({msg:"Ship placement goes out of board", input:req.body});
                }
                var end_j = (shipObj.orientation === "horizontal")?(shipObj.start[1]+ship_to_size[ship]):shipObj.start[1]+1;
                if(end_j > theGrid[0].length)
                {
                    return res.status(400).json({msg:"Ship placement goes out of board", input:req.body});
                }
            
                for( var i = shipObj.start[0]; i<end_i; i++)
                {
                    for(var j = shipObj.start[1] ; j<end_j; j++)
                    {
                        if(theGrid[i][j] > 0)
                        {
                            return res.status(400).json({msg:"Two ships cannot occupy a the same cell", input:req.body});
                        }
                        theGrid[i][j] = (k+1);
                    }
                }
            }
            oceanGrid.Grid = Array();
            for(var i=0; i<10; i++)
            {
                oceanGrid.Grid.push(theGrid[i].slice());
            }
            var oGridObj = new Grid(oceanGrid);
            grids.push(oGridObj);
            duplicateGrid.Grid = theGrid;
            var dGridObj = new Grid(duplicateGrid);
            grids.push(dGridObj);
            Grid.create(grids).then((createdGrids) => {
                gameUpdateQueryObj = {};
                gameUpdateQueryObj._id = gameId;
                gameUpdateObj = {};
                for(var i=0; i<3; i++)
                {
                    if(String(games[0].Player_One) === String(playerId))
                    {
                        if(games[0].Player_One_Ocean_Grid)
                        {
                            return res.status(400).json({msg:"The player has already created the corresponding grid"});
                        }
                        if(createdGrids[i].Type === "target")
                        {
                            gameUpdateObj.Player_One_Target_Grid = createdGrids[i]._id;
                        }
                        else if(createdGrids[i].Type === "ocean")
                        {
                            if(gameUpdateObj.Player_One_Ocean_Grid)
                            {
                                gameUpdateObj.Player_One_Original_Grid = createdGrids[i]._id;
                            }
                            else
                            {
                                gameUpdateObj.Player_One_Ocean_Grid = createdGrids[i]._id;
                            }
                        }
                        gameUpdateObj.Player_One_Remaining = 17;
                    }
                    else
                    {
                        if(games[0].Player_Two_Ocean_Grid)
                        {
                            return res.status(400).json({msg:"The player has already created the corresponding grid"});
                        }
                        if(createdGrids[i].Type === "target")
                        {
                            gameUpdateObj.Player_Two_Target_Grid = createdGrids[i]._id;
                        }
                        else if(createdGrids[i].Type === "ocean")
                        {
                            if(gameUpdateObj.Player_Two_Ocean_Grid)
                            {
                                gameUpdateObj.Player_Two_Original_Grid = createdGrids[i]._id;
                            }
                            else
                            {
                                gameUpdateObj.Player_Two_Ocean_Grid = createdGrids[i]._id;
                            }
                        }
                        gameUpdateObj.Player_Two_Remaining = 17;
                    }
                }
                Game.updateOne(gameUpdateQueryObj,gameUpdateObj, (err) => {
                    if(err)
                    {
                        return res.status(500).json({msg:"Some problem occurred while updating game"});
                    }
                    successResponseObj = Object()
                    successResponseObj.msg = "Grids created successfully!"
                    successResponseObj.data = createdGrids;
                    return res.status(201).json(successResponseObj);
                });
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({msg:"Problem with inserting grids to the database"});
            });;

        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Problem with fetching games from the database"});
        });;
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching players from the database"});
    });;
});

module.exports = router;