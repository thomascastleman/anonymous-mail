
/* 
	admin.js: Routes for administrators
*/

var auth = require('./auth.js');
var con = require('./database.js').connection;

module.exports = {
	// set up routes
	init: function(app, soc) {
		// list of all letter UIDs currently being modified
		var currentlyModifyingLetters = [];

		// set up listener for socket connection in admin portal
		soc.on('connection', function(socket) {
			var currentlyModifying;

			// when admin now editing letter, add letter uid to list of letters to block off from being edited
			socket.on('currentlyModifying', function(letterUID) {
				currentlyModifying = letterUID;
				currentlyModifyingLetters.push(letterUID);
			});

			// on 'requestLetter' --> check that no other admin is currently editing that letter draft
			socket.on('requestLetter', function(letterUID) {
				// check if letter UID in list of letters currently being edited, and respond
				socket.emit('requestLetterResponse', (currentlyModifyingLetters.indexOf(letterUID) == -1), letterUID);

			});

			// on 'saveDraft' --> INSERT or UPDATE a new draft for a given letter
			socket.on('saveDraft', function(data) {
				// check for existing draft
				con.query('SELECT * FROM drafts WHERE letter_uid = ?;', [data.letterUID], function(err, rows) {
					if (!err && rows !== undefined && rows.length > 0) {
						// update content of existing draft
						con.query('UPDATE drafts SET content = ? WHERE uid = ?;', [data.draft, rows[0].uid], function(err, rows) {
							// notify of success / failure
							socket.emit('draftSavedResponse', err === null);
						});
					} else {
						// insert a new draft
						con.query('INSERT INTO drafts (content, letter_uid) VALUES (?, ?);', [data.draft, data.letterUID], function(err, rows) {
							if (!err) {
								// update status as existing draft
								con.query('UPDATE waiting_letters SET draft_started = 1 WHERE uid = ?;', [data.letterUID], function(err, rows) {
									// notify of success / failure
									socket.emit('draftSavedResponse', err === null);
								});
							} else {
								// notify of failure
								socket.emit('draftSavedResponse', false);
							}
						});
					}
				});
			});

			// handle disconnection from socket
			socket.on('disconnect', function() {
				// remove any letter that was being modified by this user
				var index = currentlyModifyingLetters.indexOf(currentlyModifying);

				if (index > -1) {
					currentlyModifyingLetters.splice(index, 1);
				}
			});
		});

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
			// get letter sender email
			con.query('SELECT sender_email FROM waiting_letters WHERE uid = ?;', [req.params.id], function(err, rows) {
				if (!err && rows !== undefined && rows.length > 0) {

					// SEND EMAIL TO rows[0].sender_email WITH CONTENT req.body.response THROUGH NODEMAILER

					console.log("Sending email to " + rows[0].sender_email);
					console.log("Content: " + req.body.response);

					res.end();


					// Now, delete the letter from waiting_letters and also any associated drafts in the drafts table

				} else {
					res.render('error.html', { message: "Unable to locate sender email." });
				}
			});

		});

		// create a new administrator account
		app.post('/newAdmin', auth.isAdmin, function(req, res) {
			// attempt to insert a new administrator account
			con.query('INSERT INTO administrators (full_name, email) VALUES (?, ?);', [req.body.name, req.body.email], function(err, rows) {
				if (!err) {
					// notify of success
					res.render('adminAuthSuccess.html', { name: req.body.name, email: req.body.email });
				} else {
					// notify of error
					res.render('error.html', { message: "Unable to add new adminstrator." });
				}
			});
		});
	}

};