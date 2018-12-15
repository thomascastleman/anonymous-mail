
/* 
	admin.js: Routes for administrators
*/

var auth = require('./auth.js');
var con = require('./database.js').connection;

module.exports = {
	// set up routes
	init: function(app) {
		// authenticate user as administator and show admin portal
		app.get('/admin', auth.restrictAdmin, function(req, res) {
			var render = {};

			// get all letters currently awaiting responses
			con.query('SELECT SUBSTR(content, 1, 50) AS preview, uid, sender_email, DATE_FORMAT(time_received, "%I:%i %p on %M %D, %Y") AS time_received, draft_started FROM waiting_letters;', function(err, rows) {
				if (!err && rows !== undefined) {
					render.letters = rows;
				}

				res.render('adminPage.html', render);
			});
		});
	}

};