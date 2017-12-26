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
	this.mx = null;
	this.my = null;

	this. dir = {
		left : false,
		right : false,
		top : false,
		down : false,
	};
	
	this.intialise();
}

Tank.prototype = {

	intialise: function(){
		this.$arena.append('div id ="'+this.id + '" class = "tank tank'+this.id+'"</div>')
	},

	setCannonAngle: function(){
		var tank = { x: this.x , y: this.y};
		var deltaX = this.mx - tank.x;
		var deltaY = this.my - tank.y;
		this.cannonAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
		this.cannonAngle += 90;
	},

	setControls: function(){
		var t = this;

		/* Detect both keypress and keyup to allow multiple keys
		 and combined directions */
		$(document).keypress( function(e){
			var k = e.keyCode || e.which;
			switch(k){
				case 119: //W
					t.dir.up = true;
					break;
				case 100: //D
					t.dir.right = true;
					break;
				case 115: //S
					t.dir.down = true;
					break;
				case 97: //A
					t.dir.left = true;
					break;
			}

		}).keyup( function(e){
			var k = e.keyCode || e.which;
			switch(k){
				case 87: //W
					t.dir.up = false;
					break;
				case 68: //D
					t.dir.right = false;
					break;
				case 83: //S
					t.dir.down = false;
					break;
				case 65: //A
					t.dir.left = false;
					break;
			}
		}).mousemove( function(e){ //Detect mouse for aiming
			t.mx = e.pageX - t.$arena.offset().left;
			t.my = e.pageY - t.$arena.offset().top;
			t.setCannonAngle();
		}).click( function(){
			t.shoot();
		});

	},
	
	shoot: function(){
		if(this.dead){
			return;
		}

		//Emit ball to server
		var serverBall = {};
		//Just for local balls who have owner
		serverBall.alpha = this.cannonAngle * Math.PI / 180; //angle of shot in radians
		//Set init position
		var cannonLength = 60;
		var deltaX = cannonLength * Math.sin(serverBall.alpha);
		var deltaY = cannonLength * Math.cos(serverBall.alpha);

		serverBall.ownerId = this.id;
		serverBall.x = this.x + deltaX - 5;
		serverBall.y = this.y - deltaY - 5;

		this.game.socket.emit('shoot', serverBall);
	}

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