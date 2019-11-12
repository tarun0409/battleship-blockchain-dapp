var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GridSchema = new Schema({
    Type:String,
    Grid:Array
});

module.exports = mongoose.model('Grid', GridSchema);