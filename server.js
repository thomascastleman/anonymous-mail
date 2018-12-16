var express 			= require('express');
var app 				= express();
var mustacheExpress 	= require('mustache-express');
var bodyParser 			= require('body-parser');
var cookieParser 		= require('cookie-parser');
var session 			= require('cookie-session');
var passport 			= require('passport');
var creds				= require('./credentials.js');
var server          	= require('http').createServer(app);
var socket          	= require('socket.io')(server);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('html', mustacheExpress());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

// configure session
app.use(session({ 
	secret: creds.SESSION_SECRET,
	name: 'session',
	resave: true,
	saveUninitialized: true
}));

var database = require('./database.js');	// add db file
var auth = require('./auth.js').init(app, passport);	// add auth file
var user = require('./user.js').init(app);	// add user routes
var admin = require('./admin.js').init(app, socket);	// add administrator routes

// start server
server.listen(8080, function() {
	console.log('Anonymous Mail server listening on port %d', server.address().port);
});