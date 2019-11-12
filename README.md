# battleship-blockchain-dapp
Blockchain based Decentralized Application for Battleship

Database API for the game

1.  Create “ocean” type grid

POST : localhost:9000/grid?playerId={playerId}&gameId={gameId}

{
    "Type":"owned",
    "Carrier":{
        "start":[1,2],
        "orientation":"horizontal"
    },
    "Battleship":{
        "start":[6,1],
        "orientation":"horizontal"
    },
    "Cruiser":{
        "start":[4,5],
        "orientation":"vertical"
    },
    "Submarine":{
        "start":[5,6],
        "orientation":"horizontal"
    },
    "Destroyer":{
        "start":[3,3],
        "orientation":"vertical"
    }
}

2. Create “target” type grid

POST : localhost:9000/grid?playerId={playerId}&gameId={gameId}

{
    "Type":"target"
}

3. Create player

POST: localhost:9000/player

{
    "Name":"Player 1",
    "Public_Key":"PB1”
}

4. Create an empty game

POST: localhost:9000/game

{
    "Name":"Game 1"
}

5. Player to join a game

POST: localhost:9000/player/{playerId}/join/{gameId}

6. Attacking

POST: localhost:9000/game/{gameId}/attack?playerId={playerId}&row={row_num}&column={col_num}

7. Announce Effect

POST: localhost:9000/game/{gameId}/effect/{hit/miss}?playerId={playerId}

8. Announce Sunken ship

POST: localhost:9000/game/{gameId}/announce_sink/{shipName}?playerId={playerId}

9. Get all games

GET: localhost:9000/game

10. Get particular game 

GET: localhost:9000/game/{gameId}

11. Get all players

GET: localhost:9000/player

12. Get particular player

GET: localhost:9000/player/{playerId}

13. Get grid for a player and game

GET: localhost:9000/grid?playerId={playerId}&game={gameId}
