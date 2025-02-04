Note-Taking App.  

<-- important -->
1- Run the app with 'https'.
2- Register a new user then sign-in when Google account is not signed-in. 

Endpoints:
https://localhost:3000 => Auth0 login
https://localhost:3000/users/register => Register page
https://localhost:3000/users/login => Login page
https://localhost:3000/users/profile => Users' profile page
https://localhost:3000/notes/index => My notes / To manage CRUD operations for notes
https://localhost:3000/notes/test-error => Test the error handling middleware

After you initialize npm you need to download the following dependencies: 
"bcryptjs"
"body-parser"
"connect-flash"
"cookie-parser"
"dotenv"
"ejs"
"express"
"express-openid-connect"
"express-session"
"fs"
"https"
"jsonwebtoken"
"mongoose"
"morgan"
"passport"
"passport-auth0"
"passport-local"
"serve-favicon"

<-- Potential errors you might face and solutions -->

* Error:
AggregateError: Issuer.discover() failed.
    OPError: expected 200 OK, got: 426 Upgrade Required
    OPError: expected 200 OK, got: 426 Upgrade Required
=> The error "426 Upgrade Required" means that Auth0 requires HTTPS but your request is being sent over HTTP.

* Error:
MongoServerError: E11000 duplicate key error collection: NoteTakingApp.users index: username_1 dup key: { username: null }
=> The error MongoServerError: E11000 duplicate key error means that MongoDB is trying to insert a duplicate value into a unique index. The specific issue here is:
Run this command in the MongoDB shell or Compass to drop the index:
db.users.dropIndex("username_1")

* Error:
CastError: Cast to ObjectId failed for value "google-oauth2|102192053889763241926" (type string) at path "user" for model "Note"
=> The CastError: Cast to ObjectId failed means that your Mongoose schema is expecting an ObjectId, but it's receiving a string ("google-oauth2|102192053889763241926") instead.
Modify your Mongoose schema so user is stored as a String instead of ObjectId.

* Error:
Using 'form_post' for response_mode may cause issues for you logging in over http, see https://github.com/auth0/express-openid-connect/blob/master/FAQ.md
=> This warning appears because you're using Auth0's OpenID Connect strategy over HTTP instead of HTTPS. By default, response_mode: "form_post" requires a secure HTTPS connection.
