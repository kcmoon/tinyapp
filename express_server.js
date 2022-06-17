
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
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: '7afr54'},
  "9sm5xK": {longURL: "http://www.google.com", userID: '8hsh7k'},
  "8my8xK": {longURL: "http://www.pinterest.com", userID: '8hsh7k'},
  "7Gj6rK": {longURL: "http://www.instagram", userID: '8hsh7k'},
};

const users = {
  "7afr54": {
    id: "7afr54",
    email: "u@u.com",
    password: "1234"
  },
  "8hsh7k": {
    id: "8hsh7k",
    email: "l@l.com",
    password: "1234"
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

const checkUserEmails = function(email) {
  for (let user in users) {
    if (users[user]['email'] === email) {
      return users[user];
    }
  }
  return null;
};

const findURLsById = function(userId) {
  let urlDatabaseById = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === userId) {
      urlDatabaseById[url] = urlDatabase[url];
    }
  }
  return urlDatabaseById;
};

// ROUTES
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get('/users.json', (req, res) => {
  res.json(users);
});

app.get('/register', (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  if (req.cookies["user_id"]) {
    res.redirect('/urls');
  } else {
    res.render('register', templateVars);
  }
});

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Cannot process request. Please enter valid email and password.');
  } else if (checkUserEmails(req.body.email)) {
    return res.status(400).send('Email already registered.');
  } else {
    let newEmail = req.body.email;
    let newPassword = req.body.password;
    let newId = generateRandomString();
    console.log('users before', users, "request.body", req.body);
    users[newId] = {
      id: newId,
      email: newEmail,
      password: newPassword
    };
    console.log('users after new user', users);
    res.cookie("user_id", newId);
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  if (req.cookies["user_id"]) {
    res.redirect('/urls');
  } else {
    res.render('login', templateVars);
  }
});

app.post('/login', (req, res) => {
  let user = checkUserEmails(req.body.email);
  if (!user) {
    return res.status(403).send('Email is not registered to an account.');
  }
  if (user.password !== req.body.password) {
    return res.status(403).send('Password is incorrect.');
  }
  res.cookie("user_id", user.id);
  res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
  const templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]};
  if (!req.cookies["user_id"]) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get("/urls", (req, res) => {
  const cookieUserID = req.cookies["user_id"];
  const templateVars = {urls: findURLsById(cookieUserID), user: users[cookieUserID]};
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const cookieUserID = req.cookies["user_id"];
  const urlsForUser = findURLsById(cookieUserID);
  const shortURL = req.params.shortURL;
  const keysOfDatabase = Object.keys(urlDatabase);
  if (!keysOfDatabase.includes(shortURL)) {
    res.status(401).send('URL not in Database.');
  } else if (!cookieUserID) {
    const templateVars = {user: null};
    return res.render("urls_show", templateVars);
  } else if (!urlsForUser[req.params.shortURL]) {
    return res.status(401).send('URL not in your Database.');
  } else {
    const templateVars = {shortURL: req.params.shortURL, longURL: urlsForUser[req.params.shortURL].longURL, user: users[cookieUserID]};
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const keysOfDatabase = Object.keys(urlDatabase);
  if (keysOfDatabase.includes(shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(401).send('URL not in Database.');
  }
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  if (!req.cookies["user_id"]) {
    res.status(401).send('You must be signed in to access features.');
  } else {
    urlDatabase[newShortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
    res.redirect(`/urls/${newShortURL}`);
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) =>{
  const cookieUserID = req.cookies["user_id"];
  const urlsForUser = findURLsById(cookieUserID);
  if (!cookieUserID) {
    return res.status(401).send('You must be signed-in to modify content.');
  }
  if (!urlsForUser[req.params.shortURL]) {
    return res.status(401).send('You are unable to modify a URL not in your Database.');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});