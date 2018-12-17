
/* 
	user.js: Routes for normal users
*/

var auth = require('./auth.js');
var con = require('./database.js').connection;

module.exports = {
	// set up routes
	init: function(app) {
		// send user the homepage when accessing root
		app.get('/', function(req, res) {
			var render = {};

			// add logout button and greeting if auth'd
			if (req.isAuthenticated()) {
				render.isAuthenticated = true;
				render.authMessage = "Welcome, " + req.user.displayName + "!";
			}

			res.render('homePage.html', render);
		});

		// handle request to receive letter writing page
		app.get('/sendLetter', auth.restrictAuth, function(req, res) {
			res.render('writeLetter.html', { email: req.user.email });
		});

		// receive a new letter
		app.post('/sendLetter', auth.isAuthenticated, function(req, res) {
			// if letter is non-empty
			if (req.body.letterContent != "") {
				// attempt to add new letter to db
				con.query('INSERT INTO waiting_letters (content, sender_email, time_received) VALUES (?, ?, NOW());', [req.body.letterContent, req.user.email], function(err, rows) {
					if (!err) {
						// register success of letter sending
						res.render('letterSentSuccess.html', {email: req.user.email, letterContent: req.body.letterContent});
					}
				});
			} else {
				// notify user that empty letters are prohibited
				res.render('error.html', { message: "Letter must have some content." });
			}
		});
	}

};