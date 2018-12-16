
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
								// update status as existing draft
								con.query('UPDATE waiting_letters SET draft_started = 1 WHERE uid = ?;', [req.params.id], function(err, rows) {
									if (!err) {
										// notify of success
										res.render('respondSuccess.html', { isDraft: 1, content: req.body.response });
									} else {
										res.render('error.html', { message: "Unable to register new draft." });
									}
								});
							} else {
								// notify of error inserting
								res.render('error.html', { message: "Unable to save draft." });
							}
						});
					}
				});
			} else {
				// get letter sender email
				con.query('SELECT sender_email FROM waiting_letters WHERE uid = ?;', [req.params.id], function(err, rows) {
					if (!err && rows !== undefined && rows.length > 0) {

						// SEND EMAIL TO rows[0].sender_email WITH CONTENT req.body.response THROUGH NODEMAILER

						console.log("Sending email to " + rows[0].sender_email);
						console.log("Content: " + req.body.response);

					} else {
						res.render('error.html', { message: "Unable to locate sender email." });
					}
				});
			}
		});

		// create a new administrator account
		app.post('/newAdmin', auth.isAdmin, function(req, res) {
			console.log(req.body);

			con.query('INSERT INTO administrators (full_name, email) VALUES (?, ?);', [req.body.name, req.body.email], function(err, rows) {
				if (!err) {
					res.render('adminAuthSuccess.html', { name: req.body.name, email: req.body.email });
				} else {
					res.render('error.html', { message: "Unable to add new adminstrator." });
				}
			});
		});
	}

};