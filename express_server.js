const PORT = 8080; // default port 8080
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  c6UTxQ: { longURL: "https://www.kala.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
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
function addKeyValuePair(stURL, lURL, ID) {
  urlDatabase[stURL] = {
    longURL: lURL,
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
}
// Add a route for /urls
app.get("/urls", (req, res) => {

 urls = urlsForUser(req.cookies["user_id"]);

  let templateVars =
  {
    user: users[req.cookies["user_id"]],
    urls: urls
  };
  //console.log(templateVars);
  res.render("urls_index", templateVars);
});


//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;  // Log the POST request body to the console
  let userID = req.cookies["user_id"];

  addKeyValuePair(shortURL, longURL, userID);
  //console.log(urlDatabase);
  res.redirect(`/urls`);         // redirect to /urls
});

//Add a POST Route to delet a URL from the list of URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  
  let shortURL = req.params.shortURL;
  if ( urlDatabase[shortURL].userID === req.cookies["user_id"]) {
   //delete urlDatabase[shortURL];
  } 
  res.redirect('/urls');
});

//Add a POST Route to edit a longURL in the list of URLs
app.post("/urls/:shortURL/Edit", (req, res) => {
  let shortURL = req.params.shortURL;
  if ( urlDatabase[shortURL].userID === req.cookies["user_id"]) {
    res.redirect(`/urls/${shortURL}`);  
  } 
  res.redirect('/urls');
});

//Render information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  //console.log(req.params);
 // console.log(urlDatabase);
  const templateVars =
  {
    shortURL,
    longURL,
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_show", templateVars);
});


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
    
    let a = 'false'; // for checking if provided email is new
    for (const user in users) {      
      if (email === users[user].email) {
        a = 'true';             
      }
    }    
    return a;
  } else {
    return 'true'
  }
}

// Create a Registration post
app.post("/register", (req, res) => {
  const id = generateRandomID();
  const email = req.body.email;
  const password = req.body.password;
  
  if (findEmail(id, email, password) === 'true') {
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

// FUNCTION TO CHECK IF email and paasword are match 
const checkEmailPass = function(email, password) {
  let ID ='';
  for (const user in users) {
    //console.log(users[user].email);
    if (users[user].email === email && users[user].password === password) {
      ID = users[user].id;
    }
  }
  console.log(ID);
  return ID;
};


//Add a POST Route to login with email and pass
app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  let ID;

  let idUser = checkEmailPass(email, password);
  if (idUser) { 

    res.cookie('user_id', idUser);
    //res.send('ok')
    res.redirect('/urls'); 

  } else {
    res.status(404).send('email or password not match')
  }
});


app.get("/login", (req, res) => {
  let templateVars ={
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

  //only registered and logged in users access to urls/new
   if (templateVars.user) {
    res.render("urls_new",templateVars);
  } else {
    res.redirect('/urls'); 
  }
  
});



//Render information about a single URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
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