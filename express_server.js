const PORT = 8080; // default port 8080
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//users database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


//Generate a Random ShortURL
function generateRandomString() {
  let forShorURL = Math.random().toString(36).substring(6);
  return forShorURL;
}

// function to add new URL to urlDatabase
function addKeyValuePair(stURL, lURL) {
  urlDatabase[stURL] = lURL;
}

// Add a route for /urls
app.get("/urls", (req, res) => {

  let templateVars =
  {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  console.log(templateVars);
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
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//Add a POST Route to edit a longURL in the list of URLs
app.post("/urls/:shortURL/Edit", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(shortURL);
  res.redirect(`/urls/:shortURL`);         // redirect to /urls/shortURL
});

/* //Add a POST Route to login
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');         // redirect to /urls
}); */

//Add a POST Route to logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  //res.send('ok')
  res.redirect('/urls');
});

// GET route for regiteration
app.get("/register", (req, res) => {
  let templateVars =
  {
    user: users[req.cookies["user_id"]]
  };
  
  res.render("users_new",templateVars);
  });

const generateRandomID = function() {
  let randID = `user${Math.random().toString(36).substring(6)}`;
  return randID
}

const findEmail = function(id, email, password) {
  if (email && password) {    
    
    let a = 'true'; // for checking if provided email is new
    for (const user in users) {      
      if (email === users[user].email) {
        a = 'false';             
      }
    }    
    return a;
  } else {
    return 'false'
  }
}

// Create a Registration post
app.post("/register", (req, res) => {
  const id = generateRandomID();
  const email = req.body.email;
  const password = req.body.password;
  
  if (findEmail(id, email, password) === 'false') {
    res.status(404).send('email already exist or you forgot to enter password or email ')
  } else { 
    ID_new ={
      'id': id,
      'email': email,
      'password': password
    }
    users[id] = ID_new; // add new ID to existing user
    res.cookie('user_id', ID_new['id']);
    res.redirect('/urls');         // redirect to /urls
  }
});

//Add a POST Route to login with email and pass
app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  let ID;
  //findig user id from  the provided email
  for (const user in users) {
    if (email === users[user].email) {
      ID = users[user].id;
      //console.log(ID);  //            
    }
  }
  res.cookie('user_id', ID);      //set cookie for this loged in ID
  res.redirect('/urls');         // redirect to /urls
});


app.get("/login", (req, res) => {
  let templateVars =
  {
    user: users[req.cookies["user_id"]]
  };
  
  res.render("users_login",templateVars);
  });


//Add a GET Route to creat a new URL
app.get("/urls/new", (req, res) => {
  let templateVars =
  {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new",templateVars);
});

//Render information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars =
  {
    shortURL,
    longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//Render information about a single URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

/* app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// creat hello_world.ejs template in views for /hello
app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
}); */


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



