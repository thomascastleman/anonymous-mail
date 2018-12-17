
var nodemailer = require('nodemailer');
var creds = require('./credentials.js');

// create email-sender with nodemailer using Google OAuth2
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: creds.MAIL_ADDRESS,
        clientId: creds.MAIL_CLIENT_ID,
        clientSecret: creds.MAIL_CLIENT_SECRET,
        refreshToken: creds.MAIL_REFRESH_TOKEN,
        accessToken: creds.MAIL_ACCESS_TOKEN
    }
});

module.exports = {
	// send a message to an individual account
	sendMail: function(options, callback) {
		// set up message info (options should be: to (recipient address), subject (email subject), text (plaintext message), html (formatted message))
		var mailOptions = Object.assign(options, {
			from: creds.MAIL_ADDRESS
		});

		// use transporter to send mail
		transporter.sendMail(mailOptions, function(err, info) {
			callback(err);
		});
	},

	// send the email response to a given letter.
	sendLetterResponse: function(toEmail, emailHTML, responseRawContent, callback) {
		module.exports.sendMail({
			to: toEmail,
			subject: "Your letter has been responded to!",
			text: responseRawContent,
			html: emailHTML
		}, callback);
	}
}