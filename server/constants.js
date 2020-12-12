const FRAME_RATE = 45;
const GRID_SIZE = 20;
var fs = require("fs");
const MAP_1  = fs.readFileSync("./maps/map1.txt").toString('utf-8');
const MAP_2  = fs.readFileSync("./maps/map2.txt").toString('utf-8');
const MAP_3  = fs.readFileSync("./maps/map3.txt").toString('utf-8');
const MAP_4  = fs.readFileSync("./maps/map4.txt").toString('utf-8');
const MAP_5  = fs.readFileSync("./maps/map5.txt").toString('utf-8');
const MAPS = new Array();

MAPS[0] = MAP_1;
MAPS[1] = MAP_2;
MAPS[2] = MAP_3;
MAPS[3] = MAP_4;
MAPS[4] = MAP_5;

		  
		   
module.exports = {
	FRAME_RATE,
	GRID_SIZE,
	MAPS, 
} 