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
    
///user lookup helper function
const getByUserEmail = (email, users) => {
  for (let randomID in users) {
    if (email === users[randomID].email) {
      return users[randomID];
    } else {
      return null;
    }
  }
};

const passwordLookUp = (password, users) => {
  for (let randomID in users) {
    if (password === users[randomID].password) {
      return users[randomID];
    } else {
      return null;
    }
  }
};
    
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

// database to keep track of all URLs and their shortened forms

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// ------------------------------- ROUTES ------------------------------- //

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
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
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
  const templateVars = { tinyURL: req.params.tinyURL,
    longURL: urlDatabase[req.params.tinyURL],
    user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});
    
//updates longURL//
app.post("/urls/:tinyURL", (req, res) => {
  let tinyURL = req.params.tinyURL;
  let longURL = req.body.longURL;
  urlDatabase[tinyURL] = longURL;
  res.redirect("/urls");
});
    
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});
    
//user login route (just email)
app.post("/login", (req, res) => {
  if (!getByUserEmail(req.body.email) || !passwordLookUp(req.body.password)) {
    res.redirect(403,'/login');
  } else if (!req.body.email || !req.body.password) {
    res.redirect(403,'/login');
  } else {
    let user = getByUserEmail(req.body.email);
    res.cookie('user_id', user.id);
    res.redirect("/urls");
  }
});
    
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
    
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});
    
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let randomID = generateRandomString();

  if (email === "" || password === "") {
    res.status(400).send("Please enter a valid username and/or password to register");
    res.redirect("/register");
  }
  if (getByUserEmail(email) === users[randomID]) {
    res.status(400).send("This email is already associated with an account. Please log in or register a new account");
    res.redirect("/register");
  } else {
    users[randomID] = { id: randomID, email: req.body.email, password: req.body.password };
    res.cookie('user_id', randomID);
    res.redirect("/urls");
  }
});
    
    
app.listen(PORT, () => {
  console.log(`TinyAapp listening on port ${PORT}!`);
});