express = require('express');
app = express();
mongoose = require('mongoose');

var db = 'mongodb://localhost/battleship';
mongoose.connect(db);

app.use(express.json());
app.use(express.urlencoded({extended:false}));
// app.use(express.static(__dirname+'/src'));

app.use('/game', require('./routes/api/game'));
app.use('/player', require('./routes/api/player'));
app.use('/grid', require('./routes/api/grid'));


const PORT = process.env.PORT || 9000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
