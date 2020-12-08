const { GRID_SIZE } = require('./constants');
let playerOneMoving, playerTwoMoving;
let playerOneShooting, playerTwoShooting;
let playerOneMousePosX, playerOneMousePosY;
let playerTwoMousePosX, playerTwoMousePosY;
let trajectoryXp1, trajectoryYp1;
let trajectoryXp2, trajectoryYp2;

module.exports = {
	initGame,
	gameLoop,
	getUpdatedVelocity,
	playerOneMove,
	playerTwoMove,
	playerOneStop,
	playerTwoStop,
	shoot,
	saveMousePosition,
}

function initGame() {
	const state = createGameState()
	randomFood(state);
	return state;
}

function createGameState() {
	playerOneShooting = false;
	playerTwoShooting = false;
	return {
		players: [{
			pos: {
				x: 3,
				y: 10,
			},
			vel: {
				x: 0,
				y: 0,
			},
			bullet:
				[{
					x: 0,
					y: 0,
				}],
			body: [
				{ x: 3, y: 10 },
			],
			mouseLoc: {
				x: 0,
				y: 0,
			},

		}, {
			pos: {
				x: 18,
				y: 10,
			},
			vel: {
				x: 0,
				y: 0,
			},
			bullet:
				[{
					x: 18,
					y: 10,
				}],
			body: [
				{ x: 18, y: 10 },
			],
			mouseLoc: {
				x: 0,
				y: 0,
			},

		}],
		food: {},
		gridsize: GRID_SIZE,
		active: true,
	};
}


function gameLoop(state) {
	if (!state) {
		return;
	}

	const playerOne = state.players[0];
	const playerTwo = state.players[1];

	playerOne.mouseLoc.x = playerOneMousePosX;
	playerOne.mouseLoc.y = playerOneMousePosY;

	playerTwo.mouseLoc.x = playerTwoMousePosX;
	playerTwo.mouseLoc.y = playerTwoMousePosY;

	/** Moving */

	if (playerOneMoving) {
		playerOne.pos.x += playerOne.vel.x;
		playerOne.pos.y += playerOne.vel.y;

	}
	if (playerTwoMoving) {
		playerTwo.pos.x += playerTwo.vel.x;
		playerTwo.pos.y += playerTwo.vel.y;
	}

	/**P1 Shooting */

	if (!playerOneShooting) {
		trajectoryXp1 = (playerOne.mouseLoc.x / 30) - playerOne.pos.x; //devide mouse loc by 30 for grid of 20
		trajectoryYp1 = (playerOne.mouseLoc.y / 30) - playerOne.pos.y;
	}

	if (playerOneShooting) {
		playerOne.bullet[0].x = playerOne.bullet[0].x + (trajectoryXp1 * 0.2);
		playerOne.bullet[0].y = playerOne.bullet[0].y + (trajectoryYp1 * 0.2);
		if (playerOne.bullet[0].x < 0 || playerOne.bullet[0].x > GRID_SIZE || playerOne.bullet[0].y < 0 || playerOne.bullet[0].y > GRID_SIZE) {
			playerOneShooting = false; //   (outside canvas)

		}
	}
	else {
		playerOne.bullet[0].x = playerOne.pos.x;
		playerOne.bullet[0].y = playerOne.pos.y;
	}

	/**P2 Shooting */

	if (!playerTwoShooting) { 
		trajectoryXp2 = (playerTwo.mouseLoc.x / 30) - playerTwo.pos.x; //devide mouse loc by 30 for grid of 20
		trajectoryYp2 = (playerTwo.mouseLoc.y / 30) - playerTwo.pos.y;
	}

	if (playerTwoShooting) {
		playerTwo.bullet[0].x = playerTwo.bullet[0].x + (trajectoryXp2 * 0.2);
		playerTwo.bullet[0].y = playerTwo.bullet[0].y + (trajectoryYp2 * 0.2);
		if (playerTwo.bullet[0].x < 0 || playerTwo.bullet[0].x > GRID_SIZE || playerTwo.bullet[0].y < 0 || playerTwo.bullet[0].y > GRID_SIZE) {
			playerTwoShooting = false; //   (outside canvas)

		}
	}
	else {
		playerTwo.bullet[0].x = playerTwo.pos.x;
		playerTwo.bullet[0].y = playerTwo.pos.y;
	}


	/**TO CHANGE */

	if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
		return 2; // player 2 wins  (outside canvas)

	}
	if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
		return 1; // player 1 wins  (outside canvas)

	}

	if (state.food.x == playerOne.pos.x && state.food.y == playerOne.pos.y) { //on food 
		playerOne.body.push({ ...playerOne.pos }); //body grows
		playerOne.pos.x += playerOne.vel.x;
		playerOne.pos.y += playerOne.vel.y;
		randomFood(state);
	}

	if (state.food.x == playerTwo.pos.x && state.food.y == playerTwo.pos.y) { //on food 
		playerTwo.body.push({ ...playerTwo.pos }); //body grows
		playerTwo.pos.x += playerTwo.vel.x;
		playerTwo.pos.y += playerTwo.vel.y;
		randomFood(state);
	}

	if (playerOne.vel.x || playerOne.vel.y) {
		for (let cell of playerOne.body) {
			if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
				//return 2; //player 2 wins (bumped head)
			}
		}

		playerOne.body.push({ ...playerOne.pos });
		playerOne.body.shift();
	}

	if (playerTwo.vel.x || playerTwo.vel.y) {
		for (let cell of playerTwo.body) {
			if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
				//return 1; //player 1 wins (bumped head)
			}
		}

		playerTwo.body.push({ ...playerTwo.pos });
		playerTwo.body.shift();
	}

	return false; //there is no winner
}

function randomFood(state) {
	food = {
		x: Math.floor(Math.random() * GRID_SIZE),
		y: Math.floor(Math.random() * GRID_SIZE),
	}

	for (let cell of state.players[0].body) {
		if (cell.x === food.x && cell.y === food.y) {
			return randomFood(state); //find square that isnt body
		}
	}

	for (let cell of state.players[1].body) {
		if (cell.x === food.x && cell.y === food.y) {
			return randomFood(state); //find square that isnt body
		}
	}
	state.food = food;
}

function getUpdatedVelocity(keyCode) {
	switch (keyCode) {
		case 65: { //left
			return { x: -0.15, y: 0 };
		}
		case 87: { //up
			return { x: 0, y: -0.15 };
		}
		case 68: { //right
			return { x: 0.15, y: 0 };
		}
		case 83: { //down
			return { x: 0, y: 0.15 };
		}
	}
}


function shoot(state, clientNumber) {
	if (clientNumber === 1) {
		playerOneShooting = true;
	}
	else if (clientNumber === 2){
		playerTwoShooting = true;
	}

}

function saveMousePosition(mouseX, mouseY, clientNumber) {

	if (clientNumber === 1) {
		playerOneMousePosX = mouseX;
		playerOneMousePosY = mouseY;
	}
	else {
		playerTwoMousePosX = mouseX;
		playerTwoMousePosY = mouseY;
	}
}

function playerOneMove() {
	playerOneMoving = true;
}

function playerTwoMove() {
	playerTwoMoving = true;
}

function playerOneStop() {
	playerOneMoving = false;
}

function playerTwoStop() {
	playerTwoMoving = false;
}


