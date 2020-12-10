const PORT = 8080; // default port 8080
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Generate a Random ShortURL
function generateRandomString() {
  let forShorURL = Math.random().toString(36).substring(6);
  //console.log(forShorURL);
  return forShorURL;
}

// function to add new URL to urlDatabase
function addKeyValuePair(stURL, lURL) {
    urlDatabase[stURL] = lURL; 
}

// Add a route for /urls
app.get("/urls", (req, res) => {

  let templateVars = {
        username: req.cookies["username"],
        urls: urlDatabase };
    
 
  res.render("urls_index", templateVars);
});


//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
   let longURL = req.body.longURL;  // Log the POST request body to the console
  addKeyValuePair(shortURL, longURL);
  res.redirect(`/urls`);         // redirect to /urls
});

//Add a POST Route to delet a URL from the list of URLs
app.post("/urls/:shortURL/delete", (req, res) => {

  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');         // redirect to /urls
  
});

//Add a POST Route to edit a longURL in the list of URLs
app.post("/urls/:shortURL/Edit", (req, res) => {

  let shortURL = req.params.shortURL;
  console.log(shortURL);
  //urlDatabase[req.params.shortURL];
  res.redirect(`/urls/:shortURL`);         // redirect to /urls/shortURL
  
});

//Add a POST Route to login
app.post("/login", (req, res) => {
  //console.log(req.body.username);
  res.cookie('username', req.body.username);
  res.redirect('/urls');         // redirect to /urls
});


//Add a POST Route to logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');         // redirect to /urls
});


//Add a GET Route to creat a new URL
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]};
  res.render("urls_new",templateVars);
});

//Render information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL, username: req.cookies["username"]};
  res.render("urls_show", templateVars);
  });

//Render information about a single URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// creat hello_world.ejs template in views for /hello
app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



