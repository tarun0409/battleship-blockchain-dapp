const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
ObjectId = require('mongodb').ObjectID;
Player = require('../../models/Player.model');
Game = require('../../models/Game.model');

router.get('/',(req,res) => {
    Player.find().then((players) => {
        if(players.length === 0)
        {
            return res.status(204).json({players:[]});
        }
        res.json({players});
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching players from the database"});
    });
});

router.get('/:id',(req,res) => {
    var playerId = ObjectId(req.params.id);
    var playerQuery = {};
    playerQuery._id = playerId;
    Player.find(playerQuery).then((players) => {
        if(players.length === 0)
        {
            return res.status(204).json({players:[]});
        }
        res.json({players});
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching players from the database"});
    });
});

router.post('/',(req,res) => {
    if(!req.body)
    {
        return res.status(400).json({msg:"Invalid format."});
    }
    var players = Array();
    var player = {};
    if(!req.body.User_Name)
    {
        return res.status(400).json({msg:"Fields to be inserted : User_Name"});
    }
    if(!req.body.Public_Key)
    {
        return res.status(400).json({msg:"Fields to be inserted : Public_Key"});
    }
    if(!req.body.Password)
    {
        return res.status(400).json({msg:"Fields to be inserted : Password"});
    }
    var playerQuery = {};
    var orArr = Array();
    var unObj = {};
    unObj.User_Name = req.body.User_Name;
    orArr.push(unObj);
    var pkObj = {};
    pkObj.Public_Key = req.body.Public_Key;
    orArr.push(pkObj);
    playerQuery["$or"] = orArr;
    Player.find(playerQuery).then(async (players) => {
        if(players.length > 0)
        {
            return res.status(400).json({msg:"User name or public key already taken"});
        }
        player.Name = req.body.Name;
        player.Public_Key = req.body.Public_Key;
        player.User_Name = req.body.User_Name;
        player.Password = await bcrypt.hash(req.body.Password, 10);
        var playerObj = new Player(player);
        players.push(playerObj);
        Player.create(players).then((createdPlayers) => {
            successResponseObj = Object()
            successResponseObj.msg = "Player created successfully!"
            successResponseObj.id = createdPlayers[0]._id;
            return res.status(201).json(successResponseObj);
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Problem with inserting players to the database"});
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with retrieving players from database"});
    });
});
router.post('/:playerId/join/:gameId',(req,res) => {
    var playerId = ObjectId(req.params.playerId);
    var gameId = ObjectId(req.params.gameId);
    var playerQuery = {};
    playerQuery._id = playerId;
    var gameQuery = {};
    gameQuery._id = gameId;
    Player.find(playerQuery).then((players)=> {
        if(players.length === 0)
        {
            return res.status(400).json({msg:"Invalid player ID", input:req.params.playerId});
        }
        Game.find(gameQuery).then((games) => {
            if(games.length === 0)
            {
                return res.status(400).json({msg:"Invalid game ID", input:req.params.gameId});
            }
            var game = games[0];
            var pj = game.Players_Joined;
            var gameUpdateObj = {};
            if(pj >= 2)
            {
                if(String(playerId) === String(games[0].Player_One) || String(playerId) === String(games[0].Player_Two))
                {
                    return res.status(200).json({msg:"Player already joined"});
                }
                else
                {
                    return res.status(400).json({msg:"All players joined in the game."});
                }
            }
            if(pj === 0)
            {
                gameUpdateObj.Player_One = playerId;
                gameUpdateObj.Current_Attacker = playerId;
            }
            else if(pj === 1)
            {
                gameUpdateObj.Player_Two = playerId;
                gameUpdateObj.Current_Defender = playerId;
            }
            gameUpdateObj.Players_Joined = (pj+1);
            updateQueryObj = {};
            updateQueryObj._id = gameId;
            Game.updateOne(updateQueryObj,gameUpdateObj, (err) => {
                if(err)
                {
                    return res.status(500).json({msg:"Some problem occurred while updating game"});
                }
                return res.status(200).json({msg:"Player joined successfully"});
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