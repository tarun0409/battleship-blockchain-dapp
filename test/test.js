const _isEqual = require("lodash/isEqual");
const _shuffle = require("lodash/shuffle");
var battleship = artifacts.require("Battleship");
var playerOneBoardHash = "0x1bd1a2e6d0afcba49b2ce8cd8749126088dcbc0916ca2ac53e363cd5820db3c9";//web3.utils.soliditySha3("hello0000000000000000000000005000000000544440000050003000005000300000502230000033300000000000000000000000");
var playerTwoBoardHash = "0x1bd1a2e6d0afcba49b2ce8cd8749126088dcbc0916ca2ac53e363cd5820db3c9";//web3.utils.soliditySha3("heyyy0000000000000000000000005000000000544440000050003000005000300000502230000033300000000000000000000000");
var playerOneBoard = "0000000000000000000000005000000000544440000050003000005000300000502230000033300000000000000000000000";
var playerTwoBoard = "0000000000000000000000005000000000544440000050003000005000300000502230000033300000000000000000000000";
contract('Battleship ::: Test 1',function(accounts){
  const playerA = accounts[0];
  const playerB = accounts[1];
  let gameId = -1;
//   const ships = [2, 2, 0, 0, 0, 0, 0, 0, 0];
//   const one_ether = await web3.utils.toWei("1");
  let secret;
  let salt1,salt2;
  salt1 = "hello";
  salt2 = "hello";
  let status, gridSize, targetIndex, owner, challenger, turn, winner, funds;
  it("should create game", async () => {
    const bs = await battleship.deployed();
    const one_ether = await web3.utils.toWei("1");
    gameId++; // 0

    //[secret, salt1] = _getSecrets(web3, ships);
    await bs.createGame(10, playerOneBoardHash, { from: playerA, value:one_ether });

    status = await bs.getStatus(gameId);
    // console.log(status);
    owner = await bs.getOwner(gameId);
    //console.log(owner);
    turn = await bs.getTurn(gameId);
    assert.equal(status.toNumber(), 0, "Status not OPEN");
    assert.equal(owner, playerA, "Owner address not saved");
    assert.equal(turn, owner, "Wrong turn");
  });
    it("should not join (own) game", async () => {
        const bs = await battleship.deployed();
    
        try 
        {
          await bs.joinGame(gameId, playerOneBoardHash, { from: playerA });
          assert.fail("Owner was able to join own game");
        } 
        catch (err) 
        {
          
        }
});
it("should join game", async () => {
  const bs = await battleship.deployed();
  const one_ether = await web3.utils.toWei("1");
 // [secret, salt2] = _getSecrets(web3, ships);
  //console.log(gameId);
  await bs.joinGame(gameId, playerTwoBoardHash, { from: playerB, value: one_ether });

  //[status, , , , challenger] = await bs.games.call(gameId);

  assert.equal(await bs.getChallenger(gameId), playerB, "Challenger address not saved");
  assert.equal((await bs.getStatus(gameId)).toNumber(), 1, "Status not READY");
});
it("should attack", async () => {
  const bs = await battleship.deployed();

  await bs.attack(gameId, 1,2, { from: playerA });

  //[status, , targetIndex, , , turn] = await bs.games.call(gameId);

  assert.equal((await bs.getTargetIndex(gameId)).toNumber(), 12, "Wrong attack index");
  assert.equal((await bs.getStatus(gameId)).toNumber(), 2, "Status not STARTED");
  assert.equal(await bs.getTurn(gameId), playerB, "Wrong turn");
});


it("should not be playing out of turn", async () => {
  const bs = await battleship.deployed();

  try {
    await bs.counterAttack(gameId, 1,0, false, { from: playerA });
    assert.fail("Player was able to play (not player turn)");
  } catch (err) {
    //
  }
});

// This test performs a "normal" game, with nobody cheating
it("should finish game", async () => {
  const bs = await battleship.deployed();
    //await bs.attack(gameId, 1,2, { from: playerA });
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 0, 0, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 1, 3, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 1, 0, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 1, 4, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 2, 0, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 1, 5, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 9, 0, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 1, 6, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 3, 0, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 3, 3, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 2, 0, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 0, 0, false,{from: playerA}); // getting reset here..duh
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 5, 0, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 4, 5, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 6, 0, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 5, 5, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 7, 0, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 5, 6, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 8, 0, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 5, 7, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 9, 0, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 5, 8, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 0, 1, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 6, 1, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 0, 2, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 6, 2, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 0, 3, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 6, 3, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 0, 3, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 6, 4, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 0, 3, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 6, 5, false,{from: playerA});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    await bs.counterAttack(gameId, 0, 3, true,{from: playerB});
    console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
    // await bs.counterAttack(gameId, 6, 5, false,{from: playerA});
    // console.log((await bs.getstate0()).toNumber(),(await bs.getstate1()).toNumber(),(await bs.getstate2()).toNumber());
 // console.log((await bs.getstate()).toNumber());
  //[status, , , , , , winner] = await bs.games.call(gameId);
  assert.equal((await bs.getStatus(gameId)).toNumber(), 3, "Status not FINISHED");
  assert.equal((await bs.getWinner(gameId)), playerA, "Wrong winner");
});

// // This test reveals both players ships positions
// - Player A remains the winner – because no cheating (yet)
it("should be winning", async () => {
  const bs = await battleship.deployed();
  // console.log(await bs.getHash(gameId),{from: playerA});
  // console.log(await bs.getHash(gameId),{from: playerB});
  await bs.reveal(gameId, salt1, playerOneBoard, {from: playerA});
  await bs.reveal(gameId, salt2, playerTwoBoard, {from: playerB});
  console.log(await bs.getHash(gameId));
  //[status, , , , , , winner] = await bs.games.call(gameId);

 assert.equal((await bs.getStatus(gameId)).toNumber(),4, "Status not DONE");
  assert.equal(await bs.getWinner(gameId), playerA, "Wrong winner");
});

// // This test performs a "cheated" game, where only Player B is cheating
// // In order to make sure winner is switched to Player A
// it("...should be cheating", async () => {
//   const bs = await battleship.deployed();

//   gameId++; // 1

//   [secret, salt1] = _getSecrets(web3, ships);
//   await bs.createGame(3, secret, { from: playerA });

//   [secret, salt2] = _getSecrets(web3, ships);
//   await bs.joinGame(gameId, secret, { from: playerB });

//   // Player B (winning first, but cheating)
//   await bs.attack(gameId, 0, { from: playerA });
//   await bs.counterAttack(gameId, 0, false, { from: playerB });
//   await bs.counterAttack(gameId, 1, true, { from: playerA });
//   await bs.counterAttack(gameId, 1, false, { from: playerB });
//   await bs.counterAttack(gameId, 2, true, { from: playerA });

//   [, , , , , , winner] = await bs.games.call(gameId);

//   assert.equal(winner, playerB, "Wrong winner");

//   await bs.reveal(gameId, ships.join(""), salt1, {
//     from: playerA
//   });

//   await bs.reveal(gameId, ships.join(""), salt2, {
//     from: playerB
//   });

//   [, , , , , , winner] = await bs.games.call(gameId);

//   assert.equal(winner, playerA, "Wrong winner");
// });

// // This test performs a "cheated" game, where both Players are cheating
// // In order to make sure nobody wins
// it("...should be BOTH cheating", async () => {
//   const bs = await battleship.deployed();

//   gameId++; // 2

//   [secret, salt1] = _getSecrets(web3, ships);

//   await bs.createGame(3, secret, { from: playerA });

//   [secret, salt2] = _getSecrets(web3, ships);

//   await bs.joinGame(gameId, secret, { from: playerB });

//   // Player B (winning, but cheating)
//   await bs.attack(gameId, 0, { from: playerA });
//   await bs.counterAttack(gameId, 0,0, false, { from: playerB });
//   await bs.counterAttack(gameId, 1,0, false, { from: playerA });
//   await bs.counterAttack(gameId, 1,1, false, { from: playerB });
//   await bs.counterAttack(gameId, 2,0, false, { from: playerA });
//   await bs.counterAttack(gameId, 2,1, false, { from: playerB });
//   await bs.counterAttack(gameId, 3,0, false, { from: playerA });
//   await bs.counterAttack(gameId, 3,1, false, { from: playerB });
//   await bs.counterAttack(gameId, 4,0, false, { from: playerA });
//   await bs.counterAttack(gameId, 4,1, false, { from: playerB });
//   await bs.counterAttack(gameId, 5,0, false, { from: playerA });
//   await bs.counterAttack(gameId, 5,1, false, { from: playerB });
//   await bs.counterAttack(gameId, 6,0, false, { from: playerA });
//   await bs.counterAttack(gameId, 6,1, false, { from: playerB });
//   await bs.counterAttack(gameId, 7,0, false, { from: playerA });
//   await bs.counterAttack(gameId, 7,1, false, { from: playerB });

//   [status, , , , , , winner] = await bs.games.call(gameId);

//   assert.equal(status.toNumber(), 3, "Not FINISHED");
//   assert.equal(winner, playerA, "Wrong winner");

//   await bs.reveal(gameId, ships.join(""), salt1, {
//     from: playerA
//   });

//   await bs.reveal(gameId, ships.join(""), salt2, {
//     from: playerB
//   });

//   [, , , , , , winner] = await bs.games.call(gameId);

//   assert.equal(
//     winner,
//     "0x0000000000000000000000000000000000000000",
//     "Wrong winner"
//   );
// });


// // Makes sure Loser cannot withdraw funds
// it("...should not withdraw funds", async () => {
//   const bs = await battleship.deployed();

//   await bs.attack(gameId, 0, { from: playerA });
//   await bs.counterAttack(gameId, 0, true, { from: playerB });
//   await bs.counterAttack(gameId, 1, true, { from: playerA });
//   await bs.counterAttack(gameId, 1, true, { from: playerB });

//   await bs.reveal(gameId, ships.join(""), salt1, {
//     from: playerA
//   });

//   await bs.reveal(gameId, ships.join(""), salt2, {
//     from: playerB
//   });

//   try {
//     // Player A is the winner...
//     await bs.withdraw(gameId, { from: playerB });
//     assert.fail("Loser was able to withdraw funds");
//   } catch (err) {
//     //
//   }
// });

// // Makes sure Winner can withdraw funds
// it("...should withdraw game funds", async () => {
//   const bs = await battleship.deployed();

//   const value = web3.toWei("0.5", "ether");
//   const oldBalance = await web3.eth.getBalance(playerA);

//   let tx = await bs.withdraw(gameId, { from: playerA });

//   const newBalance = await web3.eth.getBalance(playerA);
//   const gasUsed = tx.receipt.gasUsed;

//   tx = await web3.eth.getTransaction(tx.receipt.transactionHash);

//   const gabsost = tx.gasPrice.mul(gasUsed);

//   assert.equal(
//     oldBalance.toNumber() - gabsost + value * 2,
//     newBalance.toNumber(),
//     "Funds not transfered"
//   );

//   [, , , , , , , funds] = await bs.games.call(gameId);

//   assert.equal(funds.toNumber(), 0, "Funds not 0");
// });

// it("...should +10 overflow (SafeMath)", async () => {
//   const bs = await battleship.deployed();

//   const overflow = 255 + 10;

//   const val1 = await bs.safeMath.call(0, overflow);
//   assert.equal(val1.toNumber(), 0, "Value not `0`");

//   const val2 = await bs.notSafeMath.call(0, overflow);
//   assert.equal(val2.toNumber(), 9, "Value not `9`");
// });
});
function _getSecrets(web3, ships) {
  // const salt = web3.eth.sign(account, _shuffle(ships).join(""));
  const salt = web3.utils.soliditySha3(_shuffle(ships).join(""));
  const secret = web3.utils.soliditySha3(ships.join("") + salt);

  return [secret, salt];
}