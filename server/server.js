const io = require('socket.io')();
const { initGame, gameLoop,   } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');  
const state = {};
const clientRooms = {};
let currentRoomName = null;
let gameOver, playerJoined; 

io.on('connection', client => {

   client.on('keydown', handleKeydown);
   client.on('keyup', handleKeyup);
   client.on('newGame', handleNewGame);
   client.on('joinGame', handleJoinGame);
   client.on('restart', handleRestart);
   client.on('shoot', handleShoot);
   client.on('mouseMoved', handleMouseMoved);

   function handleJoinGame(roomName) {
      const room = io.sockets.adapter.rooms[roomName];

      let allUsers;
      if (room) {
         allUsers = room.sockets;
      }

      let numClients = 0;
      if (allUsers) {
         numClients = Object.keys(allUsers).length;
      }

      if (numClients === 0) {
         client.emit('unknownGame');
         return
      } else if (numClients > 1) {
         client.emit('tooManyPlayers');
         return
      }

      clientRooms[client.id] = roomName;
      client.join(roomName);
      client.number = 2;
      client.emit('init', 2);
      playerJoined = true;
      startGameInterval(roomName);
      handleRestart()
   }

   function handleNewGame() {
      let roomName = makeid(5);
      currentRoomName = roomName;
      clientRooms[client.id] = roomName;
      client.emit('gameCode', roomName);

      state[roomName] = initGame();

      client.join(roomName);
      client.number = 1; 
      client.emit('init', 1);
   }  

   function handleKeydown(keyCode) {
      const roomName = clientRooms[client.id];
      const playerNumber = client.number - 1;
      if (!roomName) {
         return;
      }

      try {
         keyCode = parseInt(keyCode);
      } catch (e) {
         console.error(e)
         return;
      }
      updateKeyStates(keyCode, true);
   }

   function handleKeyup(keyCode) {
      const roomName = clientRooms[client.id];
      const playerNumber = client.number - 1;
      if (!roomName) {
         return;
      }
      try {
         keyCode = parseInt(keyCode);
      } catch (e) {
         console.error(e)
         return;  
      }
      updateKeyStates(keyCode, false);
   }

   function updateKeyStates(keyCode, value) {   
      const roomName = clientRooms[client.id];
      const playerNumber = client.number - 1;
      if (keyCode == 68)   //right
         state[roomName].players[playerNumber].keyStates.right = value;
      else if (keyCode == 83)  //down
         state[roomName].players[playerNumber].keyStates.down = value;
      else if (keyCode == 65) //left
         state[roomName].players[playerNumber].keyStates.left = value;
      else if (keyCode == 87) // up
         state[roomName].players[playerNumber].keyStates.up = value;
   }
 
   function handleShoot() { 
      const roomName = clientRooms[client.id];
      const playerNumber = client.number - 1;
      if (playerJoined) {
         state[roomName].players[playerNumber].shooting = true;
      }
   } 

   function handleMouseMoved(mouseX, mouseY) {
      const roomName = clientRooms[client.id]; 
      const playerNumber = client.number - 1;
      if (playerJoined) {
         state[roomName].players[playerNumber].mouseLoc.x = mouseX;
         state[roomName].players[playerNumber].mouseLoc.y = mouseY;
      }
   }
     
 
});

function startGameInterval(roomName) {
   const intervalId = setInterval(() => {
      const winner = gameLoop(state[roomName]);

 
      if (!winner) { //game continues
         emitGameState(roomName, state[roomName]);
      }
      else if (winner == 1 || winner == 2){ //game over
         emitGameOver(roomName, winner);
         gameOver = true;
         //state[roomName] = null;
         //clearInterval(intervalId);

      }

   }, 1000 / FRAME_RATE);
}


function emitGameState(room, state) {
   io.sockets.in(room).emit('gameState', JSON.stringify(state));
}

function emitGameOver(room, winner) {
   io.sockets.in(room).emit('gameOver', JSON.stringify({ winner }));
}

function handleRestart() {
   state[currentRoomName] = initGame();
}
io.listen(process.env.PORT || 3000);
