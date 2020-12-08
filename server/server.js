const io = require('socket.io')();
const { initGame, gameLoop, getUpdatedVelocity, playerOneMove, playerTwoMove,
   playerOneStop, playerTwoStop,shoot, saveMousePosition,} = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};
let currentRoomName = null;
let gameOver, moving, playerJoined;
let currentKeyP1, currentKeyP2;

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

   function handleKeydown(keyCode, playerNumber) {
      const roomName = clientRooms[client.id];
      if (!roomName) {
         return;
      }

      try {
         keyCode = parseInt(keyCode);
      } catch (e) {
         console.error(e)
         return;
      }
      const vel = getUpdatedVelocity(keyCode);
      if (keyCode === 87 || keyCode === 65 || keyCode === 83 || keyCode === 68) { //holding down key

         if (playerNumber === 1) {
            currentKeyP1 = keyCode;
            playerOneMove()
         }
         if (playerNumber === 2) {
            currentKeyP2 = keyCode;
            playerTwoMove()
         }

      }

      if (vel) {
         state[roomName].players[client.number - 1].vel = vel;
      }

   }

   function handleKeyup(keyCode, playerNumber) {
      const roomName = clientRooms[client.id];
      if (!roomName) {
         return;
      }
       try {
         keyCode = parseInt(keyCode);
      } catch (e) {
         console.error(e)
         return;
      }

      if (keyCode === 87 || keyCode === 65 || keyCode === 83 || keyCode === 68) { //key released
         if (playerNumber === 1 && currentKeyP1 === keyCode) {
            playerOneStop()
         }
         if (playerNumber === 2 && currentKeyP2 === keyCode) {
            playerTwoStop()
         }

      }
   }

   function handleShoot() {
     const roomName = clientRooms[client.id];
      if (playerJoined) {
         shoot(state[roomName], client.number);
      }
   }

   function handleMouseMoved(mouseX, mouseY) {
      saveMousePosition(mouseX,mouseY,client.number)
      
      //console.log(mouseX, playerNumber);
   }

});

function startGameInterval(roomName) {
   const intervalId = setInterval(() => {
      const winner = gameLoop(state[roomName]);


      if (!winner) { //game continues
         emitGameState(roomName, state[roomName]);
      }
      else { //game over
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
