
const express = require("express");
const morgan = require('morgan');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const { cookie } = require("express/lib/response");
const req = require("express/lib/request");


// MIDDLEWARE
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');


// DATA STORES
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "uderRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * 62));
  }
  return result;
};

const checkForEmail = function(email) {
  for (let user in users) {
    if(users[user]['email'] === email) {
      return true;
    }
  }
  return false;
};

const getPasswordByEmail = function(email) {
  for (let user in users) {
    if (users[user]['email'] === email) {
      return users[user]['password'];
    }
  }
};

const getIdByEmail = function(email) {
  for (let user in users) {
    if (users[user]['email'] === email) {
      return users[user];
    }
  }
};

// ROUTES
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/register', (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]}
  res.render('register', templateVars)
});

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Cannot process request. Please enter valid email and password.');
  } else if (checkForEmail(req.body.email)) {
    return res.status(400).send('Email already registered.');
  } else {let newEmail = req.body.email;
    let newPassword = req.body.password;
    let newId = generateRandomString();
    console.log('users before', users, "request.body", req.body);
    users[newId] = {
      id: newId, 
      email: newEmail, 
      password: newPassword
    };
    console.log('users after new user', users)
    res.cookie("user_id", newId);
    res.redirect('/urls')
  };
});

app.get('/login', (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]}
  res.render('login', templateVars)
})

app.post('/login', (req, res) => {
  if (checkForEmail(req.body.email) === false) {
    return res.status(403).send('Email is not registered to an account.');
  }
  if (getPasswordByEmail(req.body.email) !== req.body.password) {
    return res.status(403).send('Password is incorrect.');
  }
  res.cookie("user_id", getIdByEmail(req.body.email));
  res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_new', templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id', undefined);
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) =>{
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});