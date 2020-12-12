const BG_COLOUR = '#231f20';
const BODY_COLOUR = '#c2c2c2';
const HP_COLOUR = '#e66916';
const socket = io('http://localhost:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

function newGame() {
	socket.emit('newGame');
	init();
}

function joinGame() {
	const code = gameCodeInput.value;
	socket.emit('joinGame', code);
	init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
	initialScreen.style.display = "none";
	gameScreen.style.display = "block";
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	canvas.width = canvas.height = 800;

	ctx.fillStyle = BG_COLOUR;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	document.addEventListener('keydown', keydown);
	document.addEventListener('keyup', keyup);
	document.addEventListener('click', shoot);
	document.addEventListener('mousemove', mouseMoved);
	gameActive = true;

}

function keydown(e) {
	if (e.keyCode === 82) {
		socket.emit('restart');
	}
	else {
		socket.emit('keydown', e.keyCode, playerNumber);
	}
}

function keyup(e) {
	socket.emit('keyup', e.keyCode, playerNumber);
}

function shoot() {
	if (gameActive) {
		socket.emit('shoot');
	}
}

function mouseMoved(e) {
	if (gameActive) {
		socket.emit('mouseMoved', e.offsetX, e.offsetY);
	}
}


function paintGame(state) {
	ctx.fillStyle = BG_COLOUR;
	ctx.fillRect(0, 0, canvas.width, canvas.height); //background

	const healthPickup = state.healthPickup;
	const gridsize = state.gridsize;
	const size = canvas.width / gridsize;

	ctx.fillStyle = HP_COLOUR;
	ctx.fillRect(healthPickup.x * size, healthPickup.y * size, size / 2.66, size / 2.66); //health pickup

	/* Map (currently draws every frame -- not ideal)*/
	ctx.fillStyle = 'grey';
	for (let wall of state.walls) {
        ctx.fillRect(wall.x * size, wall.y * size, size, size);
	}
	paintPlayer(state.players[0], size, BODY_COLOUR); 
	paintPlayer(state.players[1], size, 'red');

	/*Scores*/
    ctx.font = "30px Arial"; 
	ctx.fillStyle = 'white';
	ctx.fillText("Score:", 20,30);
	ctx.fillText(state.players[0].score, 120,30);
	ctx.fillStyle = 'red';
	ctx.fillText("Score:", 650,30);
	ctx.fillText(state.players[1].score, 750,30);
}

function paintPlayer(playerState, size, colour) {
	const body = playerState.body;
	const bullet = playerState.bullet;
	const healthBarWidth = playerState.health * 0.4;
	ctx.fillStyle = colour;

	var circle = new Path2D();

	for (let cell of body) {
		circle.arc(cell.x * size, cell.y * size, size / 2.66, 0, 2 * Math.PI); //body 
		ctx.fill(circle);

		if (playerState.health < 80 && playerState.health > 30) { //determine health colour
			ctx.fillStyle = 'yellow';
		}
		else if (playerState.health < 30) {
			ctx.fillStyle = 'red';
		}
		else {
			ctx.fillStyle = 'green';
		}
		ctx.fillRect((cell.x * size) - 20, (cell.y * size) + 20, healthBarWidth, size / 4); //health bar 
	}

	for (let cell of bullet) {
		ctx.fillStyle = colour;
		if (cell.x != playerState.pos.x && cell.y != playerState.pos.y) {
			circle.arc((cell.x * size) + 10, (cell.y * size) + 10, size / 8, 0, 2 * Math.PI);
			ctx.fill(circle); //bullet
		}
	}
}


function handleInit(number) {
	playerNumber = number;
}

function handleGameState(gameState) {
	if (!gameActive) {
		return;
	}
	gameState = JSON.parse(gameState);
	requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
	if (!gameActive) {
		return;
	}
	data = JSON.parse(data);
	if (data.winner === playerNumber) {
		//alert("You win!!");
	}
	else {
		//alert("You lose!!!");
	}
	//gameActive = false;
	socket.emit('restart');
}

function handleGameCode(gameCode) {
	gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
	reset();
	alert("Unknown game code");
}

function handleTooManyPlayers() {
	reset();
	alert("This game is already in progress");
}

function reset() {
	playerNumber = null;
	gameCodeInput.value = "";
	gameCodeDisplay.innerText = "";
	initialScreen.style.display = "block";
	gameScreen.style.display = "none";
}

