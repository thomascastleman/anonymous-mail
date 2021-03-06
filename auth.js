
/* 
	auth.js: Authentication routes / configurations and middleware for restricting pages / requests to authenticated-only
*/

var GoogleStrategy = require('passport-google-oauth2').Strategy;
var querystring = require('querystring');
var con = require('./database.js').connection;
var creds = require('./credentials.js');

module.exports = {

	// set up routes and configure authentication settings
	init: function(app, passport) {
		// cache user info from our system into their session
		passport.serializeUser(function(user, done) {
			// look for administrator with this email
			con.query('SELECT * FROM administrators WHERE email = ?;', [user.email], function(err, rows) {
				if (!err && rows !== undefined && rows.length > 0) {
					user.local = rows[0];	// record local db info in session
					user.local.isAdmin = 1;	// record that user is admin
				} else {
					// create local cache of info
					user.local = {
						email: user.email,
						full_name: user.displayName
					};
				}

				done(null, user);
			});
		});

		passport.deserializeUser(function(user, done) {
			done(null, user);
		});

		// Google OAuth2 config with passport
		passport.use(new GoogleStrategy({
				clientID:		creds.GOOGLE_CLIENT_ID,
				clientSecret:	creds.GOOGLE_CLIENT_SECRET,
				callbackURL:	creds.domain + "/auth/google/callback",
				passReqToCallback: true
			},
			function(request, accessToken, refreshToken, profile, done) {
				process.nextTick(function () {
					return done(null, profile);
				});
			}
		));

		app.use(passport.initialize());
		app.use(passport.session());

		// authentication with google endpoint
		app.get('/auth/google', module.exports.checkReturnTo, passport.authenticate('google', { scope: [
				'https://www.googleapis.com/auth/userinfo.profile',
				'https://www.googleapis.com/auth/userinfo.email'
			]
		}));

		// callback for google auth
		app.get('/auth/google/callback',
			passport.authenticate('google', {
				successReturnToOrRedirect: '/',
				failureRedirect: '/failure'
		}));

		// handler for failure to authenticate
		app.get('/failure', function(req, res) {
			res.render('error.html', { message: "Unable to authenticate." });
		});

		// logout handler
		app.get('/logout', module.exports.checkReturnTo, function(req, res){
			req.logout();
			res.redirect(req.session.returnTo || '/');
		});

		return module.exports;
	},


	// middleware to check for a URL to return to after authenticating
	checkReturnTo: function(req, res, next) {
		var returnTo = req.query['returnTo'];
		if (returnTo) {
			req.session = req.session || {};
			req.session.returnTo = querystring.unescape(returnTo);
		}
		next();
	},

	// middleware to restrict pages to authenticated users
	restrictAuth: function(req, res, next) {
		// if authenticated and has session data from our system
		if (req.isAuthenticated() && req.user.local) {
			return next();
		} else {
			res.redirect('/auth/google?returnTo=' + querystring.escape(req.url));
		}
	},

	// middleware to restrict pages to admin users
	restrictAdmin: function(req, res, next) {
		// if authenticated and has session data
		if (req.isAuthenticated() && req.user.local) {
			// if administrator, allow
			if (req.user.local.isAdmin) {
				return next();
			} else {
				res.render('error.html', { message: "You do not have administrator privileges." });
			}
		} else {
			res.redirect('/auth/google?returnTo=' + querystring.escape(req.url));
		}
	},

	// middleware (for POST reqs) to check if auth'd
	isAuthenticated: function(req, res, next) {
		if (req.isAuthenticated() && req.user.local) {
			return next();
		} else {
			res.redirect('/');
		}
	},

	// middleware (for POSTs) to check if requester is admin
	isAdmin: function(req, res, next) {
		if (req.isAuthenticated() && req.user.local && req.user.local.isAdmin == 1) {
			return next();
		} else {
			res.redirect('/');
		}
	}
};