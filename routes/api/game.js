const express = require('express');
const router = express.Router();
ObjectId = require('mongodb').ObjectID;
Game = require('../../models/Game.model');
Player = require('../../models/Player.model');
Grid = require('../../models/Grid.model');

router.get('/',(req,res) => {
    Game.find().then((games) => {
        if(games.length === 0)
        {
            return res.status(204).json({admins:[]});
        }
        var outputArr = Array();
        for(var i=0; i<games.length; i++)
        {
            var gameObj = {};
            gameObj.id = String(games[i]._id);
            gameObj.Name = games[i].Name;
            gameObj.Players_Joined = games[i].Players_Joined;
            if(games[i].Winner)
            {
                gameObj.Winner = games[i].Winner;
            }
            outputArr.push(gameObj);
        }
        res.json({games:outputArr});
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching games from the database"});
    });
});

router.get('/:id',(req,res) => {
    var gameId = ObjectId(req.params.id);
    var gameQuery = {};
    gameQuery._id = gameId;
    Game.find(gameQuery).then((games) => {
        if(games.length === 0)
        {
            return res.status(204).json({admins:[]});
        }
        res.json({games});
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching games from the database"});
    });
});

router.post('/',(req,res) => {
    if(!req.body)
    {
        return res.status(400).json({msg:"Invalid format.", input:req.body});
    }
    var games = Array();
    var game = {};
    if(!req.body.Name)
    {
        return res.status(400).json({msg:"Fields to be inserted : Name", input:req.body});
    }
    game.Name = req.body.Name;
    game.Players_Joined = 0;
    var gameObj = new Game(game);
    games.push(gameObj);
    Game.create(games).then((createdGames) => {
        successResponseObj = Object()
        successResponseObj.msg = "Game created successfully!"
        successResponseObj.data = createdGames;
        return res.status(201).json(successResponseObj);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with inserting games to the database"});
    });
});

router.post('/:gameId/attack',(req,res) => {
    if(!req.query.playerId)
    {
        return res.status(400).json({msg:"Query fields to be included : playerId", query:req.query});
    }
    if(!req.query.row)
    {
        return res.status(400).json({msg:"Query fields to be included : row", query:req.query});
    }
    if(parseInt(req.query.row) < 0 || parseInt(req.query.row) >= 10)
    {
        return res.status(400).json({msg:"Row value exceeds limit", query:req.query});
    }
    if(!req.query.column)
    {
        return res.status(400).json({msg:"Query fields to be included : column", query:req.query});
    }
    if(parseInt(req.query.column) < 0 || parseInt(req.query.column) >= 10)
    {
        return res.status(400).json({msg:"Column value exceeds limit", query:req.query});
    }
    var playerId = ObjectId(req.query.playerId);
    var gameId = ObjectId(req.params.gameId);
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
            if(!games[0].Player_One_Ocean_Grid || !games[0].Player_One_Target_Grid || !games[0].Player_Two_Ocean_Grid || !games[0].Player_Two_Target_Grid)
            {
                return res.status(400).json({msg:"One or more grids have not been set up"});
            }
            if(String(games[0].Current_Attacker) !== String(players[0]._id))
            {
                return res.status(400).json({msg:"Player cannot attack in this turn."});
            }
            if(games[0].Moves.length > 0 && !games[0].Moves[games[0].Moves.length-1].effect)
            {
                return res.status(400).json({msg:"Player has already attacked in this turn"});
            }
            moves = games[0].Moves;
            moveObj = {};
            moveObj.attack = [parseInt(req.query.row),parseInt(req.query.column)];
            moves.push(moveObj);
            gameObj = {};
            gameObj.Moves = moves;
            gameUpdateQueryObj = {};
            gameUpdateQueryObj._id = gameId;
            Game.updateOne(gameUpdateQueryObj,gameObj, (err) => {
                if(err)
                {
                    return res.status(500).json({msg:"Some problem occurred while updating game"});
                }
                var gridQuery = {};
                if(String(games[0].Player_One) === String(playerId))
                {
                    gridQuery._id = games[0].Player_One_Target_Grid;
                }
                else
                {
                    gridQuery._id = games[0].Player_Two_Target_Grid;
                }
                Grid.find(gridQuery).then((grids) => {
                    if(grids.length === 0)
                    {
                        return res.status(500).json({msg:"No target grid found"});
                    }
                    grids[0].Grid[parseInt(req.query.row)][parseInt(req.query.column)] = 2;
                    gridUpdateObj = {};
                    gridUpdateObj.Grid = grids[0].Grid;
                    Grid.updateOne(gridQuery, gridUpdateObj, (err) => {
                        if(err)
                        {
                            return res.status(500).json({msg:"Some problem occurred while updating grid"});
                        }
                        return res.status(200).json({msg:"Attack launched successfully"});
                    });

                }).catch((err) => {
                    console.log(err);
                    return res.status(500).json({msg:"Some problem occurred while fetching grid from database"});
                });
                
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

router.get('/:gameId/move',(req,res) => {
    if(!req.query.playerId)
    {
        return res.status(400).json({msg:"Query fields to be included : playerId", query:req.query});
    }
    var playerId = ObjectId(req.query.playerId);
    var gameId = ObjectId(req.params.gameId);
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
            var oppSunkShips = null;
            if(String(playerId) === String(games[0].Player_One))
            {
                oppSunkShips = games[0].Player_Two_Sunk_Ships;
            }
            else
            {
                oppSunkShips = games[0].Player_One_Sunk_Ships;
            }
            return res.status(200).json({"moves":games[0].Moves, "defender":String(games[0].Current_Defender), "opponent_sunken_ships":oppSunkShips});
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Problem with fetching games from the database"});
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching players from the database"});
    });
});
router.post('/:gameId/effect/:effect',(req,res) => {
    if(!req.query.playerId)
    {
        return res.status(400).json({msg:"Query fields to be included : playerId", query:req.query});
    }
    var effect = req.params.effect;
    var playerId = ObjectId(req.query.playerId);
    var gameId = ObjectId(req.params.gameId);
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
            if(games[0].Moves.length === 0 || games[0].Moves[games[0].Moves.length -1].effect)
            {
                return res.status(400).json({msg:"Attack has not been performed"});
            }
            if(String(games[0].Current_Defender) !== String(players[0]._id))
            {
                return res.status(400).json({msg:"Its not the player's turn to defend"});
            }
            var gridQuery = {};
            var gridIds = Array();
            if(String(players[0]._id) === String(games[0].Player_One))
            {
                gridIds.push(games[0].Player_One_Ocean_Grid);
                gridIds.push(games[0].Player_Two_Target_Grid);
            }
            else if(String(players[0]._id) === String(games[0].Player_Two))
            {
                gridIds.push(games[0].Player_Two_Ocean_Grid);
                gridIds.push(games[0].Player_One_Target_Grid);
            }
            var inSubQuery = {};
            inSubQuery["$in"] = gridIds;
            gridQuery._id = inSubQuery;
            Grid.find(gridQuery).then((grids) => {
                if(grids.length < 2)
                {
                    return res.status(400).json({msg:"Problem with fetching grids from the database"});
                }
                var index1 = games[0].Moves[games[0].Moves.length-1].attack[0];
                var index2 = games[0].Moves[games[0].Moves.length-1].attack[1];
                for(var i=0; i<grids.length; i++)
                {
                    if(grids[i].Type === "target")
                    {
                        grids[i].Grid[index1][index2] = (effect === "hit")?1:-1;
                    }
                    else
                    {
                        grids[i].Grid[index1][index2] = (effect === "hit")?-1:grids[i].Grid[index1][index2];
                    }
                }
                var gamesUpdateQuery = {};
                gamesUpdateQuery._id = gameId;
                var grid1UpdateQuery = {};
                grid1UpdateQuery._id = grids[0]._id;
                var grid2UpdateQuery = {};
                grid2UpdateQuery._id = grids[1]._id;
                games[0].Moves[games[0].Moves.length-1].effect = effect;
                var gamesUpdateObj = {};
                gamesUpdateObj.Moves = games[0].Moves;
                gamesUpdateObj.Current_Attacker = games[0].Current_Defender;
                gamesUpdateObj.Current_Defender = games[0].Current_Attacker;
                if(effect === "hit")
                {
                    if(String(games[0].Current_Defender) === String(games[0].Player_One))
                    {
                        gamesUpdateObj.Player_One_Remaining = games[0].Player_One_Remaining-1;
                    }
                    else
                    {
                        gamesUpdateObj.Player_Two_Remaining = games[0].Player_Two_Remaining-1;
                    }
                }
                var grid1UpdateObj = {};
                grid1UpdateObj.Grid = grids[0].Grid;
                var grid2UpdateObj = {};
                grid2UpdateObj.Grid = grids[1].Grid;
                Game.updateOne(gamesUpdateQuery,gamesUpdateObj, (err) => {
                    if(err)
                    {
                        return res.status(500).json({msg:"Some problem occurred while updating game"});
                    }
                    Grid.updateOne(grid1UpdateQuery,grid1UpdateObj, (err) => {
                        if(err)
                        {
                            return res.status(500).json({msg:"Some problem occurred while updating grid 1"});
                        }
                        Grid.updateOne(grid2UpdateQuery,grid2UpdateObj, (err) => {
                            if(err)
                            {
                                return res.status(500).json({msg:"Some problem occurred while updating grid 2"});
                            }
                            return res.status(200).json({msg:"Effect registered successfully"});
                        });
                    });
                });
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
router.post('/:gameId/announce_sink/:ship',(req,res) => {
    if(!req.query.playerId)
    {
        return res.status(400).json({msg:"Query fields to be included : playerId", query:req.query});
    }
    if(req.params.ship !== "Carrier" && req.params.ship !== "Battleship" && req.params.ship !== "Cruiser" && req.params.ship !== "Submarine" && req.params.ship !== "Destroyer")
    {
        return res.status(400).json({msg:"Ship is not valid", params:req.params});
    }
    var playerId = ObjectId(req.query.playerId);
    var gameId = ObjectId(req.params.gameId);
    var playerQuery = {};
    playerQuery._id = playerId;
    var gameQuery = {};
    gameQuery._id = gameId;
    var sunk_ship = req.params.ship;
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
            var gameUpdateObj = {};
            if(String(playerId) === String(games[0].Player_One) && !games[0].Player_One_Sunk_Ships.includes(sunk_ship))
            {
                games[0].Player_One_Sunk_Ships.push(sunk_ship);
                gameUpdateObj.Player_One_Sunk_Ships = games[0].Player_One_Sunk_Ships;
                if(games[0].Player_One_Sunk_Ships.length >= 5)
                {
                    gameUpdateObj.Winner = games[0].Player_Two;
                }
            }
            if(String(playerId) === String(games[0].Player_Two) && !games[0].Player_Two_Sunk_Ships.includes(sunk_ship))
            {
                games[0].Player_Two_Sunk_Ships.push(sunk_ship);
                gameUpdateObj.Player_Two_Sunk_Ships = games[0].Player_Two_Sunk_Ships;
                if(games[0].Player_Two_Sunk_Ships.length >= 5)
                {
                    gameUpdateObj.Winner = games[0].Player_One;
                }
            }
            var gameQueryObj = {};
            gameQueryObj._id = gameId;
            Game.updateOne(gameQueryObj,gameUpdateObj, (err) => {
                if(err)
                {
                    return res.status(500).json({msg:"Some problem occurred while updating games in database"});
                }
                return res.status(200).json({msg:"Sunken ship registered successfully"});
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
module.exports = router;