I am creating a Note-Taking App. 

Endpoints:
localhost:3000 => 































I started with initializing npm then i installed the following:
1- express: For building the server.
2- morgan: For logging.
3- mongoose: For connecting to MongoDB.
4- nodemon: To restart your server automatically during development.
5- ejs: For view engine
6- jsonwebtoken: For user authentication.
7- body-parser: To handle incoming request bodies.
8- dotenv: To manage environment variables.
9- serve-favicon: To add favicon to my app.
10- connect-flash: For passing messages such as success or error between requests.
11- express-session: For managing session data on the server.
12- passport: For authentication
13- passport-local: A Passport strategy for authenticating users using a username and password.

After installing components above I have done the following:
1- I created config folder then db.js file to connect to MongoDB database.
2- I created the models folder and and Note.js and User.js in order to create schemas.
3- I created public folder and inside public folder css, js and img folders.
4- I created views folder and notes, partials and users folders inside views folder.
