const FRAME_RATE = 45;
const GRID_SIZE = 20;
var fs = require("fs");
const MAP_1  = fs.readFileSync("./maps/map1.txt").toString('utf-8');
const MAPS = new Array();

MAPS[0] = MAP_1;

		  
		   
module.exports = {
	FRAME_RATE,
	GRID_SIZE,
	MAPS, 
} 