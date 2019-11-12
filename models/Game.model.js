var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({
    Name:String,
    Player_One:Schema.Types.ObjectId,
    Player_Two:Schema.Types.ObjectId,
    Player_One_Ocean_Grid:Schema.Types.ObjectId,
    Player_One_Target_Grid:Schema.Types.ObjectId,
    Player_Two_Ocean_Grid:Schema.Types.ObjectId,
    Player_Two_Target_Grid:Schema.Types.ObjectId,
    Players_Joined: Number,
    Current_Turn:Schema.Types.ObjectId,
    Moves:Array,
    Winner: Schema.Types.ObjectId
});

module.exports = mongoose.model('Game', GameSchema);