var express = require('express');
var exphbs  = require('express-handlebars'); 
var path = require('path');
var fs = require('fs');
var url = require('url');
var jsonQuery = require('json-query')
var mysql = require("mysql");

var app = express();


var hbs = exphbs.create({
	defaultLayout : 'main',
	extname : '.hbs',
	layoutsDir : __dirname + '/views/layouts',
	partialsDir : __dirname + '/views'	
});

app.engine('hbs',hbs.engine);
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, '/static')));
// First you need to create a connection to the db
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    con.query('SELECT * FROM employees',function(err,rows){
	  if(err) throw err;

	  console.log('Data received from Db:\n');
	  console.log(rows);
	});
    return;
  }
  console.log('Connection established');
});

con.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'kaushikcars',
    debug    :  false
});

function retrieveCars(req,res) {
    
    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   

        console.log('connected as id ' + connection.threadId);
        
        connection.query("select * from cars",function(err,rows){
            connection.release();
            if(!err) {
            	console.log(rows);
                res.render('home',{cars: rows});
            }           
        });

        connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;     
        });
  });
}


app.get('/', function (req, res) {
	var cardata = JSON.parse(fs.readFileSync('./data/cars.json', 'utf8'));
	console.log(cardata);
	retrieveCars(req,res);
	
});

app.get('/aboutus', function (req, res) {
    res.render('aboutus');
});


app.get('/contactus', function (req, res) {
    res.render('contactus');
});


app.get('/feature', function (req, res) {
	var queryData = url.parse(req.url, true).query;
	var selectedId = queryData.id;
	console.log('selectedId : '+selectedId);
	var cardata = JSON.parse(fs.readFileSync('./data/cars.json', 'utf8'));
	
	var result = jsonQuery('cars[*id='+selectedId +']', {data: cardata}).value
	console.log(result);
    res.render('feature',result[0]);
});


app.get('/model', function (req, res) {
    res.render('model');
});

app.get('/authenticate', function (req, res) {	
    var queryData = url.parse(req.url, true).query;
	var username = queryData.username;
	var password = queryData.password;
	
	var usersdata = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
	
	var result = jsonQuery('users[*username='+username +']', {data: usersdata}).value
	
	if(result.length >0 && result[0].password === password){
		 res.render('myaccount',result[0]);
	}else{
		var cardata = JSON.parse(fs.readFileSync('./data/cars.json', 'utf8'));
		//console.log(cardata);
		var error = {'error' : 'Invalid Credentials. Please try again'};
		cardata.errors = error;
		console.log('Final cardata: '+ JSON.stringify(cardata));
 		res.render('home',cardata);
	}
   
});


app.listen(3000, function () {
    console.log('express-handlebars example server listening on: 3000');
});
