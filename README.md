# anonymous-mail

### Purpose
This service allows a group of administrators to receive and respond to mail that comes from anonymous users.

### Clarification of Roles

Normal users (visitors to the site with no special credentials) are able to view the homepage and submit anonymous letters to the service. There is no limit on how many letters a given user may send.

Administrators (users whose credentials exist in the system database under the administrators table) are able to view the homepage, send letters, as well as viewing the administrator portal. This portal allows them to write draft responses to letters, send actual responses once those drafts are complete, and authorize new administrator accounts.


### Usage

To use, install the necessary node.js packages by running `npm install` in the project directory. Then, configure the database by logging in to MySQL and running `SOURCE create_db.sql;`.

This application uses Google OAuth2 to securely authenticate any user that attempts to use it. For access to these services, you will need a credentials file called `credentials.js`. It must take the following form:

```javascript
module.exports = {
   // Google OAuth2 credentials 
   GOOGLE_CLIENT_ID: '<YOUR GOOGLE CLIENT ID HERE>',
   GOOGLE_CLIENT_SECRET: '<YOUR GOOGLE CLIENT SECRET HERE>',

   // OAuth2 credentials for access to service email account
   MAIL_ADDRESS: '<YOUR SERVICE MAILING ADDRESS HERE>',
   MAIL_CLIENT_ID: '<YOUR MAILING CLIENT ID HERE>',
   MAIL_CLIENT_SECRET: '<YOUR MAILING CLIENT SECRET HERE>',
   MAIL_REFRESH_TOKEN: '<YOUR MAILING REFRESH TOKEN HERE>',
   MAIL_ACCESS_TOKEN: '<YOUR MAILING ACCESS TOKEN HERE>',

   // session encryption secret
   SESSION_SECRET: '<YOUR SESSION SECRET HERE>',

   // MySQL credentials
   MySQL_username: '<YOUR MYSQL USERNAME HERE>',
   MySQL_password: '<YOUR MYSQL PASSWORD HERE>',

   // localhost for testing purposes (replace this with an actual domain)
   domain: 'http://localhost:8080'
}
```

The first Google OAuth credentials are for authenticating any user that attempts to send a letter or log in as an administrator. The second set of mailing credentials is for a designated Google account to be used for this service. This account will originate all the mail that is sent. 
