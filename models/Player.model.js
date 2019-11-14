var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
    User_Name:String,
    Password:String,
    Public_Key:String,
    Games_Played:Array,
    Games_Won:Array,
});

module.exports = mongoose.model('Player', PlayerSchema);