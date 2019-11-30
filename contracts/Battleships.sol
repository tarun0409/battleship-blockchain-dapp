pragma solidity >=0.4.22 <0.6.0;

contract Battleship
{
    enum GameStatus { OPEN, STARTED, FINISHED, CLOSED }
    uint private bidAmount = 0.0001 ether;
    address payable owner;
    struct Game {
        GameStatus status;
        address payable player1;
        address payable player2;
        address attacker;
        address defender;
        address winner;
        uint bounty;
        mapping(address => bytes32) player_hashes;
        mapping(address => int8[100]) player_board;
        mapping(address => bool) player_revealed;
        mapping(address => bool) player_cheated;
        int8 currentTarget;
    }
    mapping (bytes32 => Game) public games;

    constructor () public
    {
        owner = msg.sender;
    }
    modifier gameOpen(bytes32 gameId)
    {
        require(games[gameId].status == GameStatus.OPEN, "Game is not open");
        _;
    }

    modifier gameStarted(bytes32 gameId)
    {
        require(games[gameId].status == GameStatus.STARTED, "Game has not started yet");
        _;
    }

    modifier gameFinished(bytes32 gameId)
    {
        require(games[gameId].status == GameStatus.FINISHED, "Game has not finished yet");
        _;
    }

    modifier notRegistered(bytes32 gameId)
    {
        require(games[gameId].player1 != msg.sender && games[gameId].player2 != msg.sender, "Player already registered");
        _;
    }

    modifier onlyPlayer(bytes32 gameId)
    {
        require(games[gameId].player1 == msg.sender || games[gameId].player2 == msg.sender, "Only registered players can play");
        _;
    }

    modifier playerIsAttacker(bytes32 gameId)
    {
        require(games[gameId].attacker == msg.sender, "Player cannot attack this turn");
        _;
    }

    modifier playerIsDefender(bytes32 gameId)
    {
        require(games[gameId].defender == msg.sender, "Player cannot defend this turn");
        _;
    }

    modifier attacked(bytes32 gameId)
    {
        require(games[gameId].currentTarget >= 0, "Player cannot attack this turn");
        _;
    }

    modifier defended(bytes32 gameId)
    {
        require(games[gameId].currentTarget < 0, "Player cannot defend this turn");
        _;
    }

    modifier bothPlayersRevealed(bytes32 gameId)
    {
        require(games[gameId].player_revealed[games[gameId].player1] && games[gameId].player_revealed[games[gameId].player2], "Reveal not done");
        _;
    }

    function joinGame(bytes32 gameId, bytes32 boardHash) public payable gameOpen(gameId) notRegistered(gameId)
    {
        require (msg.value >= bidAmount,"bid atleast 0.0001 ether");
        if(games[gameId].player1 == address(0))
        {
            games[gameId].player1 = msg.sender;
            games[gameId].attacker = msg.sender;
        }
        else
        {
            games[gameId].player2 = msg.sender;
            games[gameId].defender = msg.sender;
            games[gameId].status = GameStatus.STARTED;
        }
        games[gameId].player_hashes[msg.sender] = boardHash;
        games[gameId].bounty += msg.value;
        games[gameId].currentTarget = -1;
    }

    function attack(bytes32 gameId, uint8 x, uint8 y) public gameStarted(gameId) onlyPlayer(gameId) playerIsAttacker(gameId) defended(gameId)
    {
        uint index = (x*10)+y;
        games[gameId].currentTarget = int8(index);
        games[gameId].attacker = games[gameId].defender;
        games[gameId].defender = msg.sender;
    }

    function announceStatus(bytes32 gameId, bool hit) public gameStarted(gameId) onlyPlayer(gameId) playerIsDefender(gameId) attacked(gameId)
    {
        if(hit)
        {
            games[gameId].player_board[msg.sender][uint8(games[gameId].currentTarget)] = 1;
        }
        else
        {
            games[gameId].player_board[msg.sender][uint8(games[gameId].currentTarget)] = -1;
        }
        games[gameId].currentTarget = -1;
    }

    function finishGame(bytes32 gameId) public gameStarted(gameId) onlyPlayer(gameId)
    {
        games[gameId].status = GameStatus.FINISHED;
    }

    function reveal(bytes32 gameId, string memory nonce, string memory boardString) public gameFinished(gameId) onlyPlayer(gameId)
    {
        games[gameId].player_revealed[msg.sender] = true;
        bytes32 boardHash = keccak256(abi.encodePacked(nonce, boardString));
        if(boardHash != games[gameId].player_hashes[msg.sender])
        {
          games[gameId].player_cheated[msg.sender] = true;
          return;
        }
        bytes memory boardBytes = bytes(boardString);
        for(uint8 i = 0; i<100; i++)
        {
            if(games[gameId].player_board[msg.sender][i] == -1 && boardBytes[i] != bytes1('0'))
            {
              games[gameId].player_cheated[msg.sender] = true;
              break;
            }
        }
    }

    function withdraw(bytes32 gameId) public bothPlayersRevealed(gameId)
    {
        if(games[gameId].status == GameStatus.CLOSED)
        {
            return;
        }
        if(games[gameId].player_cheated[games[gameId].player1] && !games[gameId].player_cheated[games[gameId].player2])
        {
            games[gameId].player2.transfer(games[gameId].bounty);
            games[gameId].winner = games[gameId].player2;
        }
        else if(games[gameId].player_cheated[games[gameId].player2] && !games[gameId].player_cheated[games[gameId].player1])
        {
            games[gameId].player1.transfer(games[gameId].bounty);
            games[gameId].winner = games[gameId].player1;
        }
        else if(games[gameId].player_cheated[games[gameId].player1] && games[gameId].player_cheated[games[gameId].player2])
        {
            owner.transfer(games[gameId].bounty);
            games[gameId].winner = address(0);
        }
        else
        {
            msg.sender.transfer(games[gameId].bounty);
        }
        games[gameId].status = GameStatus.CLOSED;
    }

    function revealWinner(bytes32 gameId) public view bothPlayersRevealed(gameId) returns(address)
    {
        if(games[gameId].status == GameStatus.CLOSED)
        {
            return games[gameId].winner;
        }
        return address(0);
    }
}