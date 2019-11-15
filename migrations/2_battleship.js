const rpsls = artifacts.require("./Battleship");

module.exports = function(deployer){
    deployer.deploy(rpsls);
}