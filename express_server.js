///EDGE CASES///
/*  - What would happen if a client requests a short URL with a non-existant id?
    - What happens to the urlDatabase when the server is restarted?
    - What type of status code do our redirects have? What does this status code mean? */

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = () => {
  return Math.random().toString(36).substring(3, 9);
};

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// ROUTES //

// database to keep track of all URLs and their shortened forms
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {

  //////ADD COOKIES HERE/////// check W3D4 lecture
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  const templateVars = { tinyURL: req.params.tinyURL, longURL: urlDatabase[req.params.tinyURL]  };
  res.render("urls_show", templateVars);
});

//updates longURL// FIX LATER
app.post("urls/:tinyURL", (req, res) => {
  let tinyURL = req.params.tinyURL;
  let longURL = req.body.longURL;
  urlDatabase[tinyURL] = longURL;
  res.redirect("/urls");
});

//user login route + COOKIES W3D2 // NOT WORKING W3D2
app.post("/urls/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`TinyAapp listening on port ${PORT}!`);
});