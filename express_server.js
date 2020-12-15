const PORT = 8080; // default port 8080
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
let {getUserByEmail} = require('./helpers.js');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {
   /* b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  c6UTxQ: { longURL: "https://www.kala.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" } */
};

//users database
const users = {
  /*  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password:  bcrypt.hashSync("12345", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }  */
};

//Generate a Random ShortURL
function generateRandomString() {
  let forShorURL = Math.random().toString(36).substring(6);
  return forShorURL;
}

// function to add new URL to urlDatabase
function addKeyValuePair(shortUrl, longUrl, ID) {
  urlDatabase[shortUrl] = {
    longURL: longUrl,
    userID: ID
  }
};

//urlsForUse rreturnsURLs with userID equal to id of logged-in user.
const urlsForUser = function(id) {
  let urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];      
    }
  }
  return urls;
};

app.get("/", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  //only registered and logged in users access to urls/new
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
}); 

// Add a route for /urls
app.get("/urls", (req, res) => {
  let urls = urlsForUser(req.session["user_id"]);
  let templateVars =
  {
    user: users[req.session["user_id"]],
    urls: urls
  };
  res.render("urls_index", templateVars);
});
//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;  // Log the POST request body to the console
  let userID =  req.session["user_id"];
  
  addKeyValuePair(shortURL, longURL, userID);
    
  let templateVars = {
    user: users[req.session["user_id"]],
  };

  if (templateVars.user) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send("You are not allowed to edit this short URL");
  }
});

//Add a POST Route to delet a URL from the list of URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  
  let shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session["user_id"]) {
    delete urlDatabase[shortURL];
  }
  res.redirect('/urls');
});

//Add a POST Route to edit a longURL in the list of URLs
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;

  if (urlDatabase[shortURL].userID === req.session["user_id"]) {

    urlDatabase[shortURL].longURL = req.body.newlongURL;
    res.redirect('/urls');
  }
  res.status(401).send("You are not allowed to edit this short URL.");
});

//Add a GET Route to creat a new URL
app.get("/urls/new", (req, res) => {
  let templateVars =
  {
    user: users[req.session["user_id"]],
  };  
  //only registered and logged in users access to urls/new
  if (templateVars.user) {
    res.render("urls_new",templateVars);
  } else {
    res.redirect('/login');
  }
  
});

//Render information about a single URL
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  const thisUserID = urlDatabase[shortURL].userID;
  const templateVars =
  {
    shortURL,
    longURL,
    user: users[req.session["user_id"]]
  };
  
  if (thisUserID === templateVars.user.id) {
    res.render("urls_show", templateVars);
  } else {
    res.send("You are not authorized to access this url");
  }    
});

//Add a POST Route to logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// GET route for regiteration
app.get("/register", (req, res) => {
  let templateVars =
  {
    user: users[req.session["user_id"]]
  };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render("users_new",templateVars);
  }
  });

const generateRandomID = function() {
  let randID = `user${Math.random().toString(36).substring(6)}`;
  return randID
}

// Create a Registration post
app.post("/register", (req, res) => {
  const id = generateRandomID();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
 if (email && password) {

  let user = getUserByEmail(email, users);
  if (user) {
    res.status(404).send('email already exist');    
  } else { 
    ID_new ={
      'id': id,
      'email': email,
      'password':  hashedPassword
    }
    users[id] = ID_new; // add new ID to existing user
    req.session['user_id'] = ID_new['id'];
    res.redirect('/urls');         // redirect to /urls
  }
} else {
  res.status(404).send('Please enter both email & password for registeration');
  
 } 

  
});

//Add a POST Route to login with email and pass
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let ID;
  let user = getUserByEmail(email, users);
  
   if (user && bcrypt.compareSync(password,users[user].password)) {
    let idUser = users[user].userID;
    req.session['user_id'] = users[user].id; 
    res.redirect('/urls'); 
  } else {
   res.status(404).send('email doest exist or email-password do not match');
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render("users_login",templateVars);
  }
});

//Render information about a single URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
