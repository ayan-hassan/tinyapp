const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;

const { generateRandomString, emailHasUser, urlsforUser, cookieIsCurrentUser, getByUserEmail } = require("./helpers");

const users = {};

const urlDatabase = {};

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

/***********************************ROUTES****************************************/

app.get("/", (req, res) => {
  if (cookieIsCurrentUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//----------------------------------------------------------------------------------

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsforUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const tinyURL = generateRandomString();
    urlDatabase[tinyURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${tinyURL}`);
  } else {
    res.status(401).send("Please log in with a valid account in orderto create tiny URLs.");
  }
});

//----------------------------------------------------------------------------------

app.get("/urls/new", (req, res) => { ///////will need to be fixed
  if (!cookieIsCurrentUser(req.session.user_id, users)) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

//----------------------------------------------------------------------------------

app.post("/urls/:tinyURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsforUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.tinyURL)) {
    const tinyURL = req.params.shortURL;
    delete urlDatabase[tinyURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("You are not authorized to delete this tiny URL.");
  }
});

//----------------------------------------------------------------------------------

//redirects to longURL
app.get("/u/:tinyURL", (req, res) => {
  if (urlDatabase[req.params.tinyURL]) {
    const longURL = urlDatabase[req.params.tinyURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("This tiny URL does not exist.");
  }
});

//----------------------------------------------------------------------------------
    
//links to edit page
app.get("/urls/:tinyURL", (req, res) => { ///MIGHT COMEBACK AND FIX
  if (urlDatabase[req.params.tinyURL]) {
    let templateVars = {
      shortURL: req.params.tinyURL,
      longURL: urlDatabase[req.params.tinyURL].longURL,
      urlUserID: urlDatabase[req.params.tinyURL].userID,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("The tiny URL you entered does not correspond with a registered long URL.");
  }
});
    
//updates longURL//
app.post("/urls/:tinyURL", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsforUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const tinyURL = req.params.id;
    urlDatabase[tinyURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You are not authorized to edit this tiny URL.");
  }
});
    
//----------------------------------------------------------------------------------

app.get("/register", (req, res) => { ////logins not saving to object
  if (cookieIsCurrentUser(req.session.user_id, users) === true) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_register", templateVars);
  }
});
    
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Please include both a valid email and password");
  } else if (emailHasUser(email, users)) {
    res.status(400).send("This email address is already associated with a registered account");
  } else {
    const randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: email,
      password: bcrypt.hashSync(password, 10),
    };
    req.session.user_id = randomID;
    res.redirect("/urls");
  }
});

//----------------------------------------------------------------------------------

app.get("/login", (req, res) => { ////NOT WORKING
  if (cookieIsCurrentUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});
    
//user login route (just email)
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!emailHasUser(email, users)) {
    res.status(403).send("This email address is not associated with an account");
  } else {
    const userID = getByUserEmail(email, users);
    if (!bcrypt.compareSync(password, users[userID].password)) {
      res.status(403).send("The password you have entered doesn't match one associated with the provided email address");
    } else {
      req.session.user_id = userID;
      res.redirect("/urls");
    }
  }
});

//----------------------------------------------------------------------------------

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//----------------------------------------------------------------------------------
    
app.listen(PORT, () => {
  console.log(`TinyAapp listening on port ${PORT}!`);
});