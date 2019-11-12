const express = require('express');
const router = express.Router();
ObjectId = require('mongodb').ObjectID;
Grid = require('../../models/Grid.model');
Player = require('../../models/Player.model');
Game = require('../../models/Game.model');

router.get('/',(req,res) => {
    Grid.find().then((grids) => {
        if(grids.length === 0)
        {
            return res.status(204).json({grids:[]});
        }
        res.json({grids});
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching grids from the database"});
    });
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
            if(!games[0].Player_One)
            {
                return res.status(400).json({msg:"Grid can be created only after joining the game"});
            }
            var grids = Array();
            var grid = {};
            if(!req.body.Type)
            {
                return res.status(400).json({msg:"Fields to be inserted : Type", input:req.body});
            }
            if(req.body.Type != "ocean" && req.body.Type!="target")
            {
                return res.status(400).json({msg:"Grid type should be ocean or target", input:req.body});
            }
            if(req.body.Type === "ocean")
            {
                if(!req.body.Carrier || !req.body.Battleship || !req.body.Cruiser || !req.body.Submarine || !req.body.Destroyer)
                {
                    return res.status(400).json({msg:"One or more of the battleships have not been set", input:req.body});
                }
            }
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
    
            if(req.body.Type === "ocean")
            {
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
                            theGrid[i][j] = ship_to_size[ship];
                        }
                    }
                }
            }
            grid.Type = req.body.Type;
            grid.Grid = theGrid;
            var gridObj = new Grid(grid);
            grids.push(gridObj);
            Grid.create(grids).then((createdGrid) => {
                gameUpdateQueryObj = {};
                gameUpdateQueryObj._id = gameId;
                gameUpdateObj = {};
                if(String(games[0].Player_One) === String(playerId) && req.body.Type === "ocean" && !games[0].Player_One_Ocean_Grid)
                {
                    gameUpdateObj.Player_One_Ocean_Grid = createdGrid[0]._id;
                }
                else if(String(games[0].Player_One) === String(playerId) && req.body.Type === "target" && !games[0].Player_One_Target_Grid)
                {
                    gameUpdateObj.Player_One_Target_Grid = createdGrid[0]._id;
                }
                else if(String(games[0].Player_One) === String(playerId))
                {
                    return res.status(400).json({msg:"The player has already created the corresponding grid"});
                }
                else if(!games[0].Player_Two)
                {
                    return res.status(400).json({msg:"Grid can be created only after joining the game"});
                }
                else if(String(games[0].Player_Two) === String(playerId) && req.body.Type === "ocean")
                {
                    gameUpdateObj.Player_Two_Ocean_Grid = createdGrid[0]._id;
                }
                else if(String(games[0].Player_Two) === String(playerId) && req.body.Type === "target")
                {
                    gameUpdateObj.Player_Two_Target_Grid = createdGrid[0]._id;
                }
                else
                {
                    return res.status(400).json({msg:"The player has already created the corresponding grid"});
                }
                Game.updateOne(gameUpdateQueryObj,gameUpdateObj, (err) => {
                    if(err)
                    {
                        return res.status(500).json({msg:"Some problem occurred while updating game"});
                    }
                    successResponseObj = Object()
                    successResponseObj.msg = "Grid created successfully!"
                    successResponseObj.data = createdGrid;
                    return res.status(201).json(successResponseObj);
                });
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({msg:"Problem with inserting grid to the database"});
            });

        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Problem with fetching games from the database"});
        });

    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching games from the database"});
    });
    
});
module.exports = router;