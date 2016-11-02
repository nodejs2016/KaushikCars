var express = require('express');
var exphbs  = require('express-handlebars'); 
var path = require('path');
var fs = require('fs');
var url = require('url');
var jsonQuery = require('json-query')

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

app.get('/', function (req, res) {
	var cardata = JSON.parse(fs.readFileSync('./data/cars.json', 'utf8'));
	console.log(cardata);
    res.render('home',cardata);
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


app.listen(3000, function () {
    console.log('express-handlebars example server listening on: 3000');
});
