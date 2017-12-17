const express = require("express");
const app = express();
app.use(express.static('public'))

var server =  app.listen(4000, function(){
	console.log("Server started at port 4000" + __dirname);
})

app.get("/", function(req, res){
	res.sendFile(__dirname + '/public/index.html');
})