const _isEqual = require("lodash/isEqual");
const _shuffle = require("lodash/shuffle");
var battleship = artifacts.require("Battleship");
// var playerOneBoardHash = "0x1bd1a2e6d0afcba49b2ce8cd8749126088dcbc0916ca2ac53e363cd5820db3c9";//web3.utils.soliditySha3("hello0000000000000000000000005000000000544440000050003000005000300000502230000033300000000000000000000000");
// var playerTwoBoardHash = "0x1bd1a2e6d0afcba49b2ce8cd8749126088dcbc0916ca2ac53e363cd5820db3c9";//web3.utils.soliditySha3("heyyy0000000000000000000000005000000000544440000050003000005000300000502230000033300000000000000000000000");
var playerOneBoard = "5555500000444400000033300000003330000000220000000000000000000000000000000000000000000000000000000000";
var playerTwoBoard = "5555500000444400000033300000003330000000220000000000000000000000000000000000000000000000000000000000";
var player1Nonce = "player1Nonce";
var player2Nonce = "player2Nonce";
var playerOneBoardHash = web3.utils.soliditySha3(player1Nonce+playerOneBoard);
var playerTwoBoardHash = web3.utils.soliditySha3(player2Nonce+playerTwoBoard);
contract('Battleship ::: Test 1',function(accounts){
  const playerA = accounts[0];
  const playerB = accounts[1];
  let gameId = web3.utils.fromAscii("random");
  it("one player should be able to join a game",async () => {
    const bs = await battleship.deployed();
    await bs.joinGame(gameId, playerOneBoardHash, { from: playerA, value:100000000000000 });
    var player1 = await bs.getPlayerOne(gameId, {from:playerA});
    assert(player1 === playerA, "Player did not join the game");
  });
  it("two players should be able to join a game",async () => {
    const bs = await battleship.deployed();
    await bs.joinGame(gameId, playerTwoBoardHash, { from: playerB, value:100000000000000 });
    var gameStarted = bs.gameIsStarted(gameId,{from:playerA});
    assert(gameStarted, "Game status is not started");
  });
  it("player one should be able to attack",async () => {
    const bs = await battleship.deployed();
    await bs.attack(gameId, 0,0, {from:playerA});
    var playerAttacked = bs.playerHasAttacked(gameId,{from:playerA});
    assert(playerAttacked, "Players attack did not register");
  });
  it("player one should be able to defend",async () => {
    const bs = await battleship.deployed();
    await bs.announceStatus(gameId, true, {from:playerB});
    var playerDefended = bs.playerHasDefended(gameId,{from:playerA});
    assert(playerDefended, "Players defence did not register");
  });
  it("should be able to make consecutive moves",async () => {
    const bs = await battleship.deployed();
    await bs.attack(gameId, 0,0, {from:playerB});
    await bs.announceStatus(gameId, false, {from:playerA}); //player has cheated
    await bs.attack(gameId, 0,1, {from:playerA});
    await bs.announceStatus(gameId, true, {from:playerB});
    var playerDefended = bs.playerHasDefended(gameId,{from:playerA});
    assert(playerDefended, "Players defence did not register");
  });
  it("player should be able to finish the game",async () => {
    const bs = await battleship.deployed();
    await bs.finishGame(gameId, {from:playerB});
    var gameFinished = bs.gameIsFinished(gameId,{from:playerA});
    assert(gameFinished, "Player was not able to finish game");
  });
  it("players should be able to reveal",async () => {
    const bs = await battleship.deployed();
    await bs.reveal(gameId, player1Nonce, playerOneBoard, {from:playerA});
    await bs.reveal(gameId, player2Nonce, playerTwoBoard, {from:playerB});
    var bothPlayersRevealed = bs.twoPlayersRevealed(gameId,{from:playerA});
    assert(bothPlayersRevealed, "Player was not able to reveal");
  });
  it("players cheating should have been registered",async () => {
    const bs = await battleship.deployed();
    var cheated = await bs.playerOneCheated(gameId, {from:playerA});
    assert(cheated, "Players cheating was not registered");
  });
  it("should be able to withdraw",async () => {
    const bs = await battleship.deployed();
    await bs.withdraw(gameId, {from:playerA});
    var closed = await bs.gameIsClosed(gameId,{from:playerA});
    assert(closed, "Game did not close");
  });
  it("should be able to reveal winner",async () => {
    const bs = await battleship.deployed();
    var exceptionOccurred = false;
    try
    {
      var winner = await bs.revealWinner(gameId, {from:playerA});
    }
    catch(err)
    {
      exceptionOccurred = true;
    }
    assert(!exceptionOccurred, "Exception should not have occurred");
  });

  // it("should not return exception",async () => {
  //     const bs = await battleship.deployed();
  //     // const one_ether = await web3.utils.toWei("1");
  //     await bs.joinGame(gameId, playerOneBoardHash, { from: playerA, value:100000000000000 });
  //     await bs.joinGame(gameId, playerTwoBoardHash, { from: playerB, value:100000000000000 });
  //     // console.log(await bs.getPlayerOne(gameId, {from:playerA}));
  //     // console.log(await bs.getPlayerTwo(gameId, {from:playerA}));
  //     await bs.attack(gameId, 1,1, {from:playerA});
  //     await bs.announceStatus(gameId, true, {from:playerB});
  //     await bs.attack(gameId,1,2,{from:playerB});
  //     assert(true,"WHAAAT?");
  // });
//   it("should create game", async () => {
//     const bs = await battleship.deployed();
//     const one_ether = await web3.utils.toWei("1");
//     // gameId++; // 0

    
//     await bs.joinGame(gameId, playerOneBoardHash, { from: playerA, value:one_ether });

//     status = await bs.getStatus(gameId);
    
//     owner = await bs.getOwner(gameId);
    
//     turn = await bs.getTurn(gameId);
//     assert.equal(status.toNumber(), 0, "Status not OPEN");
//     assert.equal(owner, playerA, "Owner address not saved");
//     assert.equal(turn, owner, "Wrong turn");
//   });

// it("should join game", async () => {
//   const bs = await battleship.deployed();
//   const one_ether = await web3.utils.toWei("1");
 
//   await bs.joinGame(gameId, playerTwoBoardHash, { from: playerB, value: one_ether });

//   assert.equal(await bs.getChallenger(gameId), playerB, "Challenger address not saved");
//   assert.equal((await bs.getStatus(gameId)).toNumber(), 1, "Status not READY");
// });
// it("should attack", async () => {
//   const bs = await battleship.deployed();

//   await bs.attack(gameId, 1,2, { from: playerA });

//   assert.equal((await bs.getTargetIndex(gameId)).toNumber(), 12, "Wrong attack index");
//   assert.equal((await bs.getStatus(gameId)).toNumber(), 2, "Status not STARTED");
//   assert.equal(await bs.getTurn(gameId), playerB, "Wrong turn");
// });


// it("should not be playing out of turn", async () => {
//   const bs = await battleship.deployed();

//   try {
//     await bs.counterAttack(gameId, 1,0, false, { from: playerA });
//     assert.fail("Player was able to play (not player turn)");
//   } catch (err) {
//     //
//   }
// });

// // This test performs a "normal" game, with nobody cheating
// it("should finish game", async () => {
//   const bs = await battleship.deployed();
//     //await bs.attack(gameId, 1,2, { from: playerA });
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 0, 0, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 1, 3, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 1, 0, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 1, 4, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 2, 0, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 1, 5, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 9, 0, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 1, 6, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 3, 0, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 3, 3, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 2, 0, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 0, 0, false,{from: playerA}); 
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 5, 0, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 4, 5, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 6, 0, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 5, 5, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 7, 0, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 5, 6, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 8, 0, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 5, 7, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 9, 0, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 5, 8, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 0, 1, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 6, 1, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 0, 2, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 6, 2, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 0, 3, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 6, 3, true,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 0, 3, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 6, 4, true,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 0, 5, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 6, 5, false,{from: playerA});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
//     await bs.counterAttack(gameId, 0, 3, true,{from: playerB});
//     console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());

//   assert.equal((await bs.getStatus(gameId)).toNumber(), 3, "Status not FINISHED");
//   assert.equal((await bs.getWinner(gameId)), playerA, "Wrong winner");
// });

// // // This test reveals both players ships positions
// // - Player A remains the winner – because no cheating (yet)
// it("boards should match", async () => {
//   const bs = await battleship.deployed();
  
//   await bs.reveal(gameId, salt1, playerOneBoard, playerA,{from: playerA});
 
//   await bs.reveal(gameId, salt2, playerTwoBoard,playerB, {from: playerB});

//  assert.equal(await bs.getWinner(gameId), playerA, "Wrong winner");
// });

// // // Makes sure Loser cannot withdraw funds
// it("loser should not withdraw funds", async () => {
//   const bs = await battleship.deployed();
//   try {
//     // Player A is the winner...
//     await bs.withdraw(gameId, { from: playerB });
//     assert.fail("Loser was able to withdraw funds");
//   } catch (err) {
//     //
//   }
// });
});
// Makes sure Winner can withdraw funds
// it("winner should withdraw game funds", async () => {
//   const bs = await battleship.deployed();
//   let tx = await bs.withdraw(gameId, { from: playerA });
//  });
// });
function _getSecrets(web3, ships) {
  // const salt = web3.eth.sign(account, _shuffle(ships).join(""));
  const salt = web3.utils.soliditySha3(_shuffle(ships).join(""));
  const secret = web3.utils.soliditySha3(ships.join("") + salt);

  return [secret, salt];
}