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
    Current_Attacker:Schema.Types.ObjectId,
    Current_Defender:Schema.Types.ObjectId,
    Moves:Array,
    Player_One_Remaining:Number,
    Player_Two_Remaining:Number,
    Player_One_Sunk_Ships:Array,
    Player_Two_Sunk_Ships:Array,
    Winner: Schema.Types.ObjectId
});

module.exports = mongoose.model('Game', GameSchema);