
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

		// render a specific letter's content for an administrator to see and respond to
		app.get('/letter/:id', auth.restrictAdmin, function(req, res) {
			var render = {};

			// get letter info with this id
			con.query('SELECT drafts.content AS draft, waiting_letters.*, DATE_FORMAT(time_received, "%I:%i %p on %M %D, %Y") AS time_received FROM waiting_letters LEFT JOIN drafts ON drafts.letter_uid = waiting_letters.uid WHERE waiting_letters.uid = ?;', [req.params.id], function(err, rows) {
				if (!err && rows !== undefined && rows.length > 0) {
					render = rows[0];
				}

				res.render('letter.html', render);
			});
		});

		// receive a letter response or draft save
		app.post('/respond/:id', auth.isAdmin, function(req, res) {
			var isDraft = parseInt(req.body.isDraft, 10);

			// attempt to save draft
			if (isDraft) {
				// check for existing draft
				con.query('SELECT * FROM drafts WHERE letter_uid = ?;', [req.params.id], function(err, rows) {
					if (!err && rows !== undefined && rows.length > 0) {
						// update content of existing draft
						con.query('UPDATE drafts SET content = ? WHERE uid = ?;', [req.body.response, rows[0].uid], function(err, rows) {
							if (!err) {
								// notify of success
								res.render('respondSuccess.html', { isDraft: 1, content: req.body.response });
							} else {
								// notify of error updating
								res.render('error.html', { message: "Unable to save draft." });
							}
						});
					} else {
						// insert a new draft
						con.query('INSERT INTO drafts (content, letter_uid) VALUES (?, ?);', [req.body.response, req.params.id], function(err, rows) {
							if (!err) {
								// notify of success
								res.render('respondSuccess.html', { isDraft: 1, content: req.body.response });
							} else {
								// notify of error inserting
								res.render('error.html', { message: "Unable to save draft." });
							}
						});
					}
				});
			} else {
				console.log("is NOT  a draft");
				res.end();
			}
		});
	}

};