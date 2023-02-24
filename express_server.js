///EDGE CASES///
/*  - What would happen if a client requests a short URL with a non-existant id?
    - What happens to the urlDatabase when the server is restarted?
    - What type of status code do our redirects have? What does this status code mean? */

const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = () => {
  return Math.random().toString(36).substring(3, 9);
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

// database to keep track of all URLs and their shortened forms
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// ------------------------ ROUTES ------------------------------- //

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});



app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let tinyURL = generateRandomString();
  urlDatabase[tinyURL] = longURL;
  res.redirect(`/urls/${tinyURL}`); // redirects user to page of generated tiny url
});

app.post("/urls/:tinyURL/delete", (req, res) => {
  delete urlDatabase[req.params.tinyURL];
  res.redirect("/urls");
});

//redirects to longURL
app.get("/u/:tinyURL", (req, res) => {
  const tinyURL = req.params.tinyURL;
  res.redirect(urlDatabase[tinyURL]);
});


//links to edit page
app.get("/urls/:tinyURL", (req, res) => {
  const templateVars = { tinyURL: req.params.tinyURL, longURL: urlDatabase[req.params.tinyURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

//updates longURL// FIX LATER
app.post("urls/:tinyURL", (req, res) => {
  let tinyURL = req.params.tinyURL;
  let longURL = req.body.longURL;
  urlDatabase[tinyURL] = longURL;
  res.redirect("/urls");
});

//user login route (just email)
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { tinyURL: req.params.tinyURL, longURL: urlDatabase[req.params.tinyURL], username: req.cookies["username"]};
  res.render("urls_register", templateVars);
});


app.listen(PORT, () => {
  console.log(`TinyAapp listening on port ${PORT}!`);
});