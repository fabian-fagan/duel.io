const { GRID_SIZE } = require('./constants');

module.exports = {
	initGame,
	gameLoop,
	getUpdatedVelocity,
}

function initGame() {
	const state = createGameState()
	randomFood(state);
	return state; 
}

function createGameState() {
	return {
		players: [{
			pos: {
				x: 3,
				y: 10,
			},
			vel: {
				x: 1,
				y: 0,
			},
			snake: [
				{ x: 1, y: 10 },
				{ x: 2, y: 10 },
				{ x: 3, y: 10 },
			],
		
		}, {
			pos: {
				x: 18,
				y: 10,
			},
			vel: {
				x: 0,
				y: 0,
			},
			snake: [
				{ x: 20, y: 10 },
				{ x: 19, y: 10 },
				{ x: 18, y: 10 },
			],
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
	
	playerOne.pos.x += playerOne.vel.x;
	playerOne.pos.y += playerOne.vel.y;

	playerTwo.pos.x += playerTwo.vel.x;
	playerTwo.pos.y += playerTwo.vel.y;

	if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
		return 2; // player 2 wins  (outside canvas)

	}
	if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
		return 1; // player 1 wins  (outside canvas)

	}

	if (state.food.x == playerOne.pos.x && state.food.y == playerOne.pos.y) { //on food 
		playerOne.snake.push({ ...playerOne.pos }); //snake grows
		playerOne.pos.x += playerOne.vel.x;
		playerOne.pos.y += playerOne.vel.y;
		randomFood(state);
	}

	if (state.food.x == playerTwo.pos.x && state.food.y == playerTwo.pos.y) { //on food 
		playerTwo.snake.push({ ...playerTwo.pos }); //snake grows
		playerTwo.pos.x += playerTwo.vel.x;
		playerTwo.pos.y += playerTwo.vel.y;
		randomFood(state);
	}

	if (playerOne.vel.x || playerOne.vel.y) {
		for (let cell of playerOne.snake) {
			if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
				return 2; //player 2 wins (bumped head)
			}
		}

		playerOne.snake.push({...playerOne.pos});
		playerOne.snake.shift();
	}

	if (playerTwo.vel.x || playerTwo.vel.y) {
		for (let cell of playerTwo.snake) {
			if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
				return 1; //player 1 wins (bumped head)
			}
		}

		playerTwo.snake.push({...playerTwo.pos});
		playerTwo.snake.shift();
	}

	return false; //there is no winner
}

function randomFood(state) {
   food = {
	   x: Math.floor(Math.random() * GRID_SIZE),
	   y: Math.floor(Math.random() * GRID_SIZE),
   }

   for (let cell of state.players[0].snake) {
	   if (cell.x === food.x && cell.y === food.y) {
		   return randomFood(state); //find square that isnt snake
	   }
   }

   for (let cell of state.players[1].snake) {
	   if (cell.x === food.x && cell.y === food.y) {
		   return randomFood(state); //find square that isnt snake
	   }
   }
   state.food = food;
}

function getUpdatedVelocity(keyCode) {
	switch (keyCode) {
		case 37: { //left
          return {x: -1, y: 0};
		}
		case 38: { //down
		  return {x:0, y: -1};
		}
		case 39: { //right
		  return {x:1, y: 0};
		}
		case 40: { //up
		  return {x:0, y: 1};
		}
	}
}