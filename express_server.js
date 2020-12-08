const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};




app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Add a route for /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


//Generate a Random ShortURL
function generateRandomString() {
  let forShorURL = Math.random().toString(36).substring(6);
  //console.log(forShorURL);
  return forShorURL;
}


// function to add new URL to urlDatabase
function addKeyValuePair(stURL, lURL) {
  //console.log(stURL);
  urlDatabase[stURL] = lURL; 
  //console.log(urlDatabase); 
}

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
   let longURL = req.body.longURL;  // Log the POST request body to the console
  addKeyValuePair(shortURL, longURL);
  res.redirect('/urls');         // redirect to /urls
});


// creat hello_world.ejs template in views for /hello
app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Render information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase.b2xVn2/* What goes here? */ };
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

