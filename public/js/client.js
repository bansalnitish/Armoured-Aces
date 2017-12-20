var socket = io();
var game = new Game();
var tankType = 1;
var tankName = "";

function Game(){

	this.tanks = [];
	this.$arena = $("#arena");
	this.socket = socket;

}

Game.prototype.addTank = function(tank){
	
	var tank = new Tank(tank, this.$arena, this);
	
	if(tank.isLocal)
		this.localTank = tank;
	
	else
		this.tanks.push(tank);
}

Game.prototype.loop = function(){

	if(this.localTank != undefined)
	{
		var sendData = {
			id : this.localTank.id,
			x : this.localTank.x,
			y : this.localTank.y,
			canonAngle : this.localTank.canonAngle,
			baseAngle : this.localTank.baseAngle
		};

		socket.emit("sync", sendData);

		this.localTank.keepMoving();
	}

}

Game.prototype.killTank = function(tank){

		this.$arena.append('<img src = "./images/explosion.gif"> id ="explode '+tank.id+'"');
		$("#explode" + tank.id).css("left", tank.x + "px");
		$("#explode" + tank.id).css("top", tank.y + "px");

		setTimeOut(function(){
			$("#explode" + tank.id).remove()
		}, 1000); // show the tank burning for 1 second

}
Game.prototype.syncPositions = function(data){

	data.tanks.forEach(function(t){
		
		if(t.id == this.localTank.id && this.localTank != undefined){
			this.localTank.health = t.health;
			
			if(this.localTank.health <= 0){
				game.killTank(this.localTank);
			}

		}

		var bool = false;

	this.tanks.forEach(function(s){
		
		if(s.id == t.id){
			s.x = t.x;
			s.y = t.y;
			s.baseAngle = t.baseAngle;
			s.canonAngle = t.canonAngle;
			s.health = t.health;

			if(s.health <= 0)
				game.killTank(s);

			bool = true;
			s.setTank();

		}
	});

	if(!bool && (t.id != this.localTank.id)){
			game.addTank(s);
	}

	});

	this.$arena.find(".balls").remove();

	data.balls.forEach(function(t){

		var s = new Ball(t, this.$arena);
		
	})


}

function Ball(ball, $arena){

	this.id = ball.id;
	this.x =  ball.x;
	this.y = ball.y;
	this.$arena = $arena;

	this.setBall();
}

Ball.prototype.setBall = function(){

		this.$arena.append('<div id = "'+ball.id+'"> </div>');
		$("#" + ball.id).css("left", this.x +"px");
		$("#"+ball.id).css("top",this.y +"px");
}

function Tank(tank, arena, game){

	this.id = tank.id;
	this.name = tank.name;
	this.type = tank.type;
	this.x = tank.x;
	this.y = tank.y;
	this.canonAngle = 0;
	this.$arena = arena;
	this.game = game;
	this.isLocal = tank..isLocal;
	this.dead = false;
	this.health = tank.health;

	this. dir = {
		left : false,
		right : false,
		top : false,
		down : false,
	};
	

}

$(document).ready(function(){

	$("#join").click(function(){
		tankName = $("#tank-name").val();
		addToGame(tankName, tankType);
	})

	$("ul.tank-selection li").click(function(){
		$("ul.tank-selection li").removeClass("selected");
		$(this).addClass("selected");
		tankType = $(this).data("tank");
	})
})


socket.on("addTank",function(tank){
		
		game.addTank(tank);
})


socket.on("sync",function(data){

		game.syncPositions(data);
})


function addToGame(tankName, tankType){
	
	if(tankName != "")
		$("#startPage").hide();
	
	socket.emit("newTank",{name : tankName, type : tankType});
}