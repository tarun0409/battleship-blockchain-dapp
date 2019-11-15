pragma solidity ^0.5.11;

contract Battleship 
{
  uint8 constant GRID_SIZE = 10;
  uint8 constant SHIP_CARRIER = 5;
  uint8 constant SHIP_BATTLESHIP = 4;
  uint8 constant SHIP_CRUISER = 3;
  uint8 constant SHIP_SUBMARINE = 3;
  uint8 constant SHIP_DESTROYER = 2;
  uint private bidAmount = 1 ether;
  int8 constant HIT = 1;
  int8 constant MISS = -1;
  uint miss = 0;
  uint hit = 0;
  uint empty = 0;
  uint win;
  uint lost;
  uint nothin;
  bytes positions;
  uint shipp;
  bytes1 cnt;
  bytes32 secret_test;//=0x1bd1a2e6d0afcba49b2ce8cd8749126088dcbc0916ca2ac53e363cd5820db3c9;
  enum GameStatus { OPEN, READY, STARTED, FINISHED, DONE }
  struct Game {
    GameStatus status;
    uint8 gridSize; //board size
    uint8 targetIndex; //index of the attack this user makes
    address payable owner; // who created the game
    address payable challenger; // who joined the already created game
    address turn; // whose turn
    address winner; // who's the winner
    uint funds;// amount required to play
    uint num; // move number
    mapping (address => bytes32) secrets; // hashes of board
    mapping (address => string) ships; // (ocean board)original location of ships , will be stored during reveal
    mapping (address => int[]) targets; // target board corresponding to a user
    mapping (address => bool) cheated; // did a particular user cheat
    uint8[100] moves_owner; // list of moves player1
    uint8[100] moves_challenger;  // list of moves player2
  }
  
  Game[] public games;

  mapping (address => uint[]) private game_list_of_a_player;

  modifier onlyPlayer(uint gameId) {
    require(msg.sender == games[gameId].owner || msg.sender == games[gameId].challenger); // either player1 or player2 only
    _;
  }

  modifier onlyWinner(uint gameId) {
    require(games[gameId].status == GameStatus.DONE); 
    require(games[gameId].winner == msg.sender); 
    _;
  }

  modifier myTurn(uint gameId) {
    require(msg.sender == games[gameId].turn);
    _;
  }

  modifier gameOpen(uint gameId) {
    require(games[gameId].status == GameStatus.OPEN);
    _;
  }

  modifier gameReady(uint gameId) {
    require(games[gameId].status == GameStatus.READY);
    _;
  }

  modifier gameStarted(uint gameId) {
    require(games[gameId].status == GameStatus.STARTED);
    _;
  }

  modifier gameFinished(uint gameId) {
    require(games[gameId].status == GameStatus.FINISHED);
    _;
  }

  modifier notRevealed(uint gameId) {
    require(bytes(games[gameId].ships[msg.sender]).length == 0); // not revealed => not yet stored in ocean board
    _;
  }

// function getHash(uint gameId) external view returns(uint)
//   {
//     return shipp;
//   }
  
  function getstate0() public view returns(uint)
  {
    return lost;
  }
  function getstate1() public view returns(uint)
  {
    return win;
  }
  function getstate2() public view returns(uint)
  {
    return nothin;
  }
  function getStatus(uint gameId) external view returns(GameStatus)
  {
    return games[gameId].status;
  }
  function getChallenger(uint gameId) external view returns(address)
  {
    return games[gameId].challenger;
  }
  function getOwner(uint gameId) external view returns(address)
  {
    return games[gameId].owner;
  }
  function getWinner(uint gameId) external view returns(address)
  {
    return games[gameId].winner;
  }
  function getTurn(uint gameId) external view returns(address)
  {
    return games[gameId].turn;
  }
  function getTargetIndex(uint gameId) external view returns(uint8)
  {
    return games[gameId].targetIndex;
  }
  function getgame_list_of_a_player(address player) external view returns(uint[] memory)
  {
    return game_list_of_a_player[player];
  }

  function getGameTarget(uint gameId, address player) external view returns(int[] memory)
  {
    return games[gameId].targets[player];
  }

  function getGameOcean(uint gameId, address player) external view returns(int[] memory)
  {
    address opponent = getOpponent(gameId, player);

    return games[gameId].targets[opponent];
  }

  
  function createGame(uint8 gridSize, bytes32 secret) public payable
  {
    require (msg.value == bidAmount,"bid 1 ether");
    uint gameId = games.length;
    games.length++;
    games[gameId].num = 0;
    games[gameId].status = GameStatus.OPEN; // created
    games[gameId].gridSize = gridSize;
    games[gameId].owner = msg.sender;
    games[gameId].turn = msg.sender; // set player1's turn
    games[gameId].secrets[msg.sender] = secret;
    games[gameId].targets[msg.sender] = new int[](gridSize ** 2); // make new target board for player1
    games[gameId].funds = msg.value;

    game_list_of_a_player[msg.sender].push(gameId);

  }

  function joinGame(uint gameId, bytes32 secret) public payable gameOpen(gameId)
  {
    require (msg.value == bidAmount,"bid 1 ether");  
    require(games[gameId].owner != msg.sender ,"owner cannot join again, he already has!"); 
    require(games[gameId].funds == msg.value,"insufficient funds");

    games[gameId].status = GameStatus.READY;
    games[gameId].challenger = msg.sender; // player2 is the challenger
    games[gameId].secrets[msg.sender] = secret;
    games[gameId].targets[msg.sender] = new int[](games[gameId].gridSize ** 2); // make new target board for player2
    games[gameId].funds += msg.value;

    game_list_of_a_player[msg.sender].push(gameId);
  }

function convert_to_1D(uint8 x, uint8 y) private pure returns(uint8)
{
    uint8 ans = (x * 10) + y;
    return(ans);
}
  function attack(uint gameId, uint8 x,uint8 y) public payable gameReady(gameId) myTurn(gameId)
  {
      uint8 index = convert_to_1D(x,y);
    address opponent = getOpponent(gameId, msg.sender);

    games[gameId].status = GameStatus.STARTED; // first attack happened

    _attack(gameId, msg.sender, opponent, index);
  }

  function counterAttack(uint gameId, uint8 x, uint8 y, bool hitt) public payable gameStarted(gameId) myTurn(gameId)
  {
    uint8 index = convert_to_1D(x,y);  
    address payable opponent = getOpponent(gameId, msg.sender);
    uint8 targetIndex = games[gameId].targetIndex;

    games[gameId].targets[opponent][targetIndex] = hitt ? HIT : MISS;

    _attack(gameId, msg.sender, opponent, index);

    uint[3] memory state = getGridState(games[gameId].targets[opponent]);
    uint fleet = 17;//getFleetSize(games[gameId].gridSize);
    lost = state[0];
    win = state[1];
    nothin = state[2];
    bool isWon = state[1] >= fleet;
    bool isVoid = (fleet - state[1]) > state[2];

    if (isWon || isVoid) {
      games[gameId].status = GameStatus.FINISHED;
      games[gameId].winner = opponent;
      //opponent.transfer(games[gameId].funds);

    }
  }

  function reveal(uint gameId, string memory salt, string memory ship, address player) public gameFinished(gameId) onlyPlayer(gameId) notRevealed(gameId)
  {
    require(getSecret(salt, ship) == games[gameId].secrets[player],"you cheated!");
    games[gameId].ships[player] = ship;
  }

  function withdraw(uint gameId) public onlyWinner(gameId) {
    // uint amount = games[gameId].funds;
    // games[gameId].funds = 0;
    msg.sender.transfer(bidAmount);
  }

  function _attack(uint gameId, address attacker, address defender, uint8 index) internal {
    games[gameId].targetIndex = index;
    games[gameId].turn = defender; // Toggle turn
    if(games[gameId].owner == attacker)
    {
      games[gameId].moves_owner[games[gameId].num]=index;
      games[gameId].num ++;
    }
    else
    {
      games[gameId].moves_challenger[games[gameId].num]=index;
    }

  }


  function getOpponent(uint gameId, address player) internal view returns(address payable) {
    return games[gameId].owner == player ? games[gameId].challenger : games[gameId].owner;
  }

  function getSecret(string memory ships, string memory salt) private pure returns(bytes32) {
    return keccak256(abi.encodePacked(ships, salt));
  }


  function getGridState(int[] memory grid)public payable returns(uint[3] memory) {
    hit = 0;
    miss = 0;
    empty = 0;
    for (uint i = 0; i < grid.length; i++) {
      if (grid[i] == MISS) {
        miss++;
      }

      if (grid[i] == HIT) {
        hit++;
      }

      if (grid[i] == 0) {
        empty++;
      }
    }

    return [miss, hit, empty];
  }

  function getMoveList(address player,uint gameId) public view returns(uint8[100] memory)
  {
    if(games[gameId].owner == player)
      return games[gameId].moves_owner;
    else
      return games[gameId].moves_challenger;
  }
  function getFleetSize(uint8 gridSize) internal pure returns(uint) {
      gridSize=10;
    return SHIP_CARRIER + SHIP_BATTLESHIP + SHIP_CRUISER + SHIP_SUBMARINE + SHIP_DESTROYER;
  }

 
}
