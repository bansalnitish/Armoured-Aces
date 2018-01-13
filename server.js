var express = require('express'),
http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var router = express.Router();

server.listen(3000);

var InitialHealth = 100;
var WIDTH = 1100;
var HEIGHT = 700;
var firstBall = 1;
var firstTank = 1;
var ballSpeed = 5;
app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res){
	res.sendFile(__dirname + '/public/index.html');
})

function GameArena(){
	this.tanks = [];
	this.balls = [];
}

GameArena.prototype.addtank = function(tank){
	this.tanks.push(tank);
}

GameArena.prototype.addball = function(ball){
	this.balls.push(ball);
}

GameArena.prototype.removetank = function(tank){
	this.tanks = this.tanks.filter(function(t){
		return t!=tankID;
	});
}

GameArena.prototype.synctank = function(tank){

	this.tanks.forEach(function(t){
		if(t.id == tank.id){
			t.x = tank.x;
			t.y = tank.y;
			t.canonAngle = tank.canonAngle;
			t.baseAngle = tank.baseAngle;
		}
	});
}
// balls are handled by server only so no data is recieved from the client except the shoot
GameArena.prototype.syncBall = function(){
	var self = this;
	this.balls.forEach(function(t){
		// if there is collision 
		self.detectCollison(t);

		if(t.x <= 0 || t.x >= WIDTH || t.y <= 0 || t.y >= HEIGHT)
			{
				t.dead = true;
				t.explode = true;
			}
	});
}

GameArena.prototype.detectCollison = function(ball){

	this.tanks.forEach(function(t){
		if(Math.abs(t.x - ball.x) < 15 && Math.abs(t.y - ball.y) < 15)
		{
			ball.dead = true;
			t.health -= 5;
			ball.explode = true;
		}
		else
			ball.keepMoving();
	})
}

GameArena.prototype.removeDeadTank = function(){
	
	this.tanks.forEach(function(t){
		if(t.health <= 0)
		{
			remove(t.id);
		}
	})
}

GameArena.prototype.removeDeadBall = function(){
	
	this.balls.forEach(function(t){
		return !t.dead;
	})
}

var game = new GameArena();

io.on("connection", function(socket){
	console.log("user connected");
	socket.on("newTank", function(tank){

	var startX = randomInteger(40,1100);
	var startY = randomInteger(40,700);
	var tankID = getTankID();

	console.log("value of startX and startY is" + startX + "" + startY);
	socket.emit("addTank", {id: tankID, name: tank.name, isLocal: true, type: tank.type, x: startX, y: startY, health: InitialHealth})
	socket.broadcast.emit("addTank", {id: tankID, name: tank.name, isLocal: false, type: tank.type, x: startX, y: startY, health: InitialHealth})

	game.addtank({id: tankID, name: tank.name, type: tank.type});

	})

	socket.on("sync", function(tank){
		//console.log("sync");
		game.synctank(tank);
		game.syncBall();
		game.removeDeadBall();
		game.removeDeadTank();

		socket.emit("sync", {tanks : game.tanks, balls : game.balls});
		socket.broadcast.emit("sync", {tanks : game.tanks, balls : game.balls});

	})

	socket.on("shoot",function(ball){
		console.log("Shooted");
		var ball = new Ball(ball.angle, ball.x, ball.y);
		game.addball(ball);
	})

})

function Ball(angle, x, y){
	this.id = getBallID();
	this.angle = angle;
	this.x = x;
	this.y = y;
	this.dead = false;
	this.explode = false;

}

Ball.prototype.keepMoving = function(){

	this.x = this.x + ballSpeed*Math.cos(this.angle);
	this.y = this.y + ballSpeed*Math.sin(this.angle);
}

function getTankID(){
	
	if(firstTank == 1000)
		firstTank = 0;

	return firstTank++;
}

function getBallID(){
	
	if(firstBall == 1000)
		firstBall = 0;

	return firstBall++;
}

function randomInteger(min, max){
	return Math.floor(Math.random() * (max - min)) + min;
}