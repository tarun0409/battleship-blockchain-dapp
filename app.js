express = require('express');
const bcrypt = require('bcrypt');
app = express();
ObjectId = require('mongodb').ObjectID;
mongoose = require('mongoose');
Player = require('./models/Player.model');

var db = 'mongodb://localhost/battleship';
mongoose.connect(db);

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(__dirname+'/src'));

app.get('/',(req,res) => {
    res.sendFile('src/gamesMain.html', { root: __dirname });
});

app.get('/register',(req,res) => {
    res.sendFile('src/playerRegister.html',{root: __dirname});
});

app.get('/login',(req,res) => {
    res.sendFile('src/playerLogin.html',{root: __dirname});
});

app.post('/login',(req,res) => {
    if(!req.body || !req.body.User_Name || !req.body.Password)
    {
        return res.status(400).json({msg:"User Name and/or Password missing"});
    }
    var playerQuery = {};
    playerQuery.User_Name = req.body.User_Name;
    Player.find(playerQuery).then(async (players) => {
        if(players.length === 0)
        {
            return res.status(400).json({msg:"User Name and/or Password incorrect"});
        }
        if(await bcrypt.compare(req.body.Password,players[0].Password))
        {
            return res.status(200).json({msg:"Login successful",id:players[0]._id});
        }
        return res.status(400).json({msg:"Incorrect Password"});
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem occurred while retrieving players from database"});
    });
});

app.get('/validateLogin/:id',(req,res) => {
    var playerId = ObjectId(req.params.id);
    var playerQuery = {};
    playerQuery._id = playerId;
    Player.find(playerQuery).then((players) => {
        if(players.length === 0)
        {
            return res.status(400).json({msg:"Player not registered"});
        }
        return res.status(200).json({msg:"Player validated"});
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({msg:"Problem occurred while retrieving players from database"});
    });
});

app.get('/play',(req,res) => {
    res.sendFile('src/gamePage.html',{root: __dirname});
});

app.get('/setup',(req,res) => {
    res.sendFile('src/gameSetup.html',{root: __dirname});
});

app.get('/battle',(req,res) => {
    res.sendFile('src/gamePlay.html',{root: __dirname});
});

app.use('/game', require('./routes/api/game'));
app.use('/player', require('./routes/api/player'));
app.use('/grid', require('./routes/api/grid'));



const PORT = process.env.PORT || 9000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
