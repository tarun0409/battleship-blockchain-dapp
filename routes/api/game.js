const express = require('express');
const router = express.Router();
ObjectId = require('mongodb').ObjectID;
Game = require('../../models/Game.model');

router.get('/',(req,res) => {
    Game.find().then((games) => {
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
module.exports = router;