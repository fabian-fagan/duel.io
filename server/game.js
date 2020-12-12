const { GRID_SIZE } = require('./constants');
const { MAPS } = require('./constants');
let trajectoryXp1, trajectoryYp1;
let trajectoryXp2, trajectoryYp2;

module.exports = {
	initGame,
	gameLoop,
}

function initGame() {
	const state = createGameState()
	randomHealthPickup(state);
	createMap(state);   
	return state;
}

function createGameState() {
	var randomMap = Math.floor(Math.random() * 5);
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
			keyStates: {
				up: false,
				down: false,
				left: false,
				right: false
			},
			moving: false,
			shooting: false,
			health: 100,
			score: 0,

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
			keyStates: {
				up: false,
				down: false,
				left: false,
				right: false
			},
			moving: false,
			shooting: false,
			health: 100,
			score: 0,

		}],
		healthPickup: {},
		gridsize: GRID_SIZE,
		active: true,
		map: MAPS[randomMap],
		walls: [{}],
	};
}


function gameLoop(state) {
	if (!state) {
		return;
	}

	const playerOne = state.players[0];
	const playerTwo = state.players[1];

	playerOne.vel = { x: 0, y: 0 };
	playerTwo.vel = { x: 0, y: 0 };

	/** P1 Moving */

	if (playerOne.keyStates.left) {
		playerOne.moving = true;
		playerOne.vel.x = -0.10;
	}
	if (playerOne.keyStates.right) {
		playerOne.moving = true;
		playerOne.vel.x = 0.10;
	}
	if (playerOne.keyStates.up) {
		playerOne.moving = true;
		playerOne.vel.y = -0.10;
	}
	if (playerOne.keyStates.down) {
		playerOne.moving = true;
		playerOne.vel.y = 0.10;
	}

	playerOne.pos.x += playerOne.vel.x;
	playerOne.pos.y += playerOne.vel.y;


	/** P2 Moving */

	if (playerTwo.keyStates.left) {
		playerTwo.moving = true;
		playerTwo.vel.x = -0.10;
	}
	if (playerTwo.keyStates.right) {
		playerTwo.moving = true;
		playerTwo.vel.x = 0.10;
	}
	if (playerTwo.keyStates.up) {
		playerTwo.moving = true;
		playerTwo.vel.y = -0.10;
	}
	if (playerTwo.keyStates.down) {
		playerTwo.moving = true;
		playerTwo.vel.y = 0.10;
	}

	playerTwo.pos.x += playerTwo.vel.x;
	playerTwo.pos.y += playerTwo.vel.y;

	/**P1 Shooting */

	if (!playerOne.shooting) {
		trajectoryXp1 = (playerOne.mouseLoc.x / 40) - playerOne.pos.x; //devide mouse loc by 40 for grid of 20
		trajectoryYp1 = (playerOne.mouseLoc.y / 40) - playerOne.pos.y;
	}

	if (playerOne.shooting) {
		playerOne.bullet[0].x = playerOne.bullet[0].x + (trajectoryXp1 * 0.15);
		playerOne.bullet[0].y = playerOne.bullet[0].y + (trajectoryYp1 * 0.15);
		if (playerOne.bullet[0].x < 0 || playerOne.bullet[0].x > GRID_SIZE || playerOne.bullet[0].y < 0 || playerOne.bullet[0].y > GRID_SIZE) {
			playerOne.shooting = false; //   (outside canvas)

		}
	}
	else {
		playerOne.bullet[0].x = playerOne.pos.x;
		playerOne.bullet[0].y = playerOne.pos.y;
	}

	/**P2 Shooting */

	if (!playerTwo.shooting) {
		trajectoryXp2 = (playerTwo.mouseLoc.x / 40) - playerTwo.pos.x; //devide mouse loc by 30 for grid of 20
		trajectoryYp2 = (playerTwo.mouseLoc.y / 40) - playerTwo.pos.y;
	}

	if (playerTwo.shooting) {
		playerTwo.bullet[0].x = playerTwo.bullet[0].x + (trajectoryXp2 * 0.2);
		playerTwo.bullet[0].y = playerTwo.bullet[0].y + (trajectoryYp2 * 0.2);
		if (playerTwo.bullet[0].x < 0 || playerTwo.bullet[0].x > GRID_SIZE || playerTwo.bullet[0].y < 0 || playerTwo.bullet[0].y > GRID_SIZE) {
			playerTwo.shooting = false; //   (outside canvas)
		}
	}
	else {
		playerTwo.bullet[0].x = playerTwo.pos.x;
		playerTwo.bullet[0].y = playerTwo.pos.y;
	}

	/**P1 hitting P2 */

	for (let cell of playerOne.bullet) {
		if (playerOne.shooting) {
			var dx = cell.x - playerTwo.pos.x;
			var dy = cell.y - playerTwo.pos.y;
			var radiiSum = 0.33 + 1;
			if ((dx * dx + dy * dy) < radiiSum * radiiSum) { //hit
				playerTwo.health -= 20;
				playerOne.shooting = false;
				if (playerTwo.health == 0) {
					playerOne.score += 1;
					return 1; // P1 wins
				}
			}
		}
	}

	/**P2 hitting P1 */

	for (let cell of playerTwo.bullet) {
		if (playerTwo.shooting) {
			var dx = cell.x - playerOne.pos.x;
			var dy = cell.y - playerOne.pos.y;
			var radiiSum = 0.33 + 1;
			if ((dx * dx + dy * dy) < radiiSum * radiiSum) { //hit
				playerOne.health -= 20;
				playerTwo.shooting = false;
				if (playerOne.health == 0) {
					playerTwo.score += 1;
					return 2; // P2 wins
				}
			}
		}
	}


	/** Health pickup */

	if (playerOne.pos.x < state.healthPickup.x + 0.5 &&
		playerOne.pos.x + 1 > state.healthPickup.x &&
		playerOne.pos.y < state.healthPickup.y + 0.5 &&
		1 + playerOne.pos.y > state.healthPickup.y) { //P1 ran into pickup

		if (playerOne.health != 100) {
			playerOne.health += 20;
			randomHealthPickup(state);
		}
	}


	if (playerTwo.pos.x < state.healthPickup.x + 0.5 &&
		playerTwo.pos.x + 1 > state.healthPickup.x &&
		playerTwo.pos.y < state.healthPickup.y + 0.5 &&
		1 + playerTwo.pos.y > state.healthPickup.y) { //P2 ran into pickup

		if (playerTwo.health != 100) {
			playerTwo.health += 20;
			randomHealthPickup(state);
		}
	}

	/**Wall collision */

	for (let wall of state.walls) {
		if (playerOne.moving) {
			if (playerOne.pos.x < wall.x + 1.5 &&
				playerOne.pos.x + 0.5 > wall.x &&
				playerOne.pos.y < wall.y + 1.5 &&
				0.5 + playerOne.pos.y > wall.y) { //P1 ran into wall
				if (playerOne.keyStates.right) {
					playerOne.pos.x -= 0.1
				}
				if (playerOne.keyStates.left) {
					playerOne.pos.x += 0.1
				}
				if (playerOne.keyStates.up) {
					playerOne.pos.y += 0.1
				}
				if (playerOne.keyStates.down) {
					playerOne.pos.y -= 0.1
				}
			}
		}
		if (playerTwo.moving) {
			if (playerTwo.pos.x < wall.x + 1.5 &&
				playerTwo.pos.x + 0.5 > wall.x &&
				playerTwo.pos.y < wall.y + 1.5 &&
				0.5 + playerTwo.pos.y > wall.y) { //P1 ran into wall
				if (playerTwo.keyStates.right) {
					playerTwo.pos.x -= 0.1
				}
				if (playerTwo.keyStates.left) {
					playerTwo.pos.x += 0.1
				}
				if (playerTwo.keyStates.up) {
					playerTwo.pos.y += 0.1
				}
				if (playerTwo.keyStates.down) {
					playerTwo.pos.y -= 0.1
				}
			}
		}
	} 

	playerOne.body.push({ ...playerOne.pos });
	playerOne.body.shift();

	playerTwo.body.push({ ...playerTwo.pos });
	playerTwo.body.shift();

	return false; //there is no winner yet
}

function randomHealthPickup(state) {
	healthPickup = {
		x: Math.floor(Math.random() * GRID_SIZE),
		y: Math.floor(Math.random() * GRID_SIZE),
	}

	for (let cell of state.players[0].body) {
		if (cell.x === healthPickup.x && cell.y === healthPickup.y) {
			return randomHealthPickup(state); //find square that isnt wall
		}
	}

	state.healthPickup = healthPickup;
}

function createMap(state) {
	var map = state.map;
	var i;
	var x = 0;
	var y = 0;
	var wall = 0;
	for (i = 0; i < (GRID_SIZE * GRID_SIZE) + 100; i++) {
		if (map.charAt(i) == 'O') { //empty
			x++;
		}
		if (map.charAt(i) == 'X') { //wall
			state.walls[wall] = { x: x, y: y, };
			wall++;
			x++;
		}
		if (map.charAt(i) == '/') { //end of line 
			y++; //increment y axis
			if (y == 20) {
				break;
			}
		}
		if (x == 20) { //reset x axis
			x = 0;
		}
	}
}

