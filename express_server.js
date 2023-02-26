///EDGE CASES///
/*  - What would happen if a client requests a short URL with a non-existant id?
    - What happens to the urlDatabase when the server is restarted?
    - What type of status code do our redirects have? What does this status code mean? */

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

const generateRandomString = () => {
  return Math.random().toString(36).substring(3, 9);
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

// database to keep track of all URLs and their shortened forms
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const authenticateUser = (email, password) => {
  const currentUser = Object.keys(users).find((user) => user.email === email);
  if (!currentUser) {
    return { err: "User doesn't exist", user: null };
  }
  if (currentUser.password !== password) {
    return { err: "Password doesn't match", user: null };
  }
  return { err: null, user: currentUser };
  // If exists, check if password is the same
  // If true, give the user, if not give null
};

///user lookup helper function
const getByUserEmail = (email) => {
  const currentUser = Object.keys(users).find((user) => user.email === email);

  if (!currentUser) {
    return { err: "User not found", user: null };
  }
  return { err: null, user: currentUser };
};

const emailLookUp = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

const passwordLookup = (password, users) => {
  for (let i in users) {
    if (users[i].password === password) {
      return true;
    }
  }
  return false;
};

//Checks if current cookie corresponds with a user in the userDatabase //
const cookieIsCurrentUser = (cookie, userDatabase) => {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
};

//checks if URLs' useriD matches the currently logged in user
const urlsforUser = (id) => {
  let result = {};
  for (const user in urlDatabase) {
    if (urlDatabase[user].userId === id) {
      result[user] = urlDatabase[user];
    }
  }
  return result;
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

// ------------------------------- ROUTES -----------------------------------------

app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/hello", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//----------------------------------------------------------------------------------

app.get("/urls", (req, res) => {
  if (!cookieIsCurrentUser(users[req.cookies["user_id"]])) {
    res.send("Please login in order to view your shortened URLs.");
  } else if
  (cookieIsCurrentUser(users[req.cookies["user_id"]]) === urlsforUser()) {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let tinyURL = generateRandomString();
  urlDatabase[tinyURL].longURL = longURL;
  res.redirect(`/urls/${tinyURL}`); // redirects user to page of generated tiny url
});

//----------------------------------------------------------------------------------

app.get("/urls/new", (req, res) => { ///////will need to be fixed
  if (!cookieIsCurrentUser(users[req.cookies["user_id"]])) {
    res.send("Please login or create an account in order to shorten URLs.");
    res.redirect("/login");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

//----------------------------------------------------------------------------------

app.post("/urls/:tinyURL/delete", (req, res) => {
  if ((cookieIsCurrentUser(users[req.cookies["user_id"]]) !== urlsforUser())) {
    res.send("You are unauthorized to delete this tiny URL");
  }
  if (!cookieIsCurrentUser(users[req.cookies["user_id"]])) {
    res.send("Please login in order to delete your shortened URLs.");
  } else if
  (cookieIsCurrentUser(users[req.cookies["user_id"]]) === urlsforUser()) {
    delete urlDatabase[req.params.tinyURL];
    res.redirect("/urls");
  }
});

//----------------------------------------------------------------------------------

//redirects to longURL
app.get("/u/:tinyURL", (req, res) => {
  const tinyURL = req.params.tinyURL;
  if (!urlDatabase[tinyURL]) {
    res.send("This shortened URL does not exist");
  }
  res.redirect(urlDatabase[tinyURL]);
});

//----------------------------------------------------------------------------------
    
//links to edit page
app.get("/urls/:tinyURL", (req, res) => {
  if (!cookieIsCurrentUser(users[req.cookies["user_id"]])) {
    res.send("Please login in order to view the shortened URL.");
  }
  if (cookieIsCurrentUser(users[req.cookies["user_id"]]) !== urlsforUser()) {
    res.send("You do not own the tiny URL of the corresponding long URL");
  } else {
    if (cookieIsCurrentUser(users[req.cookies["user_id"]]) === urlsforUser()) {
      const templateVars = { tinyURL: req.params.tinyURL,
        longURL: urlDatabase[req.params.tinyURL].longURL,
        user: users[req.cookies["user_id"]]};
      res.render("urls_show", templateVars);
    }
  }
});
    
//updates longURL//
app.post("/urls/:tinyURL", (req, res) => {
  if ((cookieIsCurrentUser(users[req.cookies["user_id"]]) !== urlsforUser())) {
    res.send("You are unauthorized to update this tiny URL");
  }
  if (!cookieIsCurrentUser(users[req.cookies["user_id"]])) {
    res.send("Please login in order to update your shortened URLs.");
  } else if
  (cookieIsCurrentUser(users[req.cookies["user_id"]]) === urlsforUser()) {
    let tinyURL = req.params.tinyURL;
    let longURL = req.body.longURL;
    urlDatabase[tinyURL].longURL = longURL;
    res.redirect("/urls");
  }
});
    
//----------------------------------------------------------------------------------

app.get("/register", (req, res) => { ////logins not saving to object
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});
    
app.post("/register", (req, res) => {
  if (emailLookUp(req.body.email)) {
    res.redirect(400, '/register');
  } else if (!req.body.email) {
    res.redirect(400, '/register');
  } else if (!req.body.password) {
    res.redirect(400, '/register');
  } else {
    const randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", randomID);
    return res.redirect("/urls");
  }
});

//----------------------------------------------------------------------------------

app.get("/login", (req, res) => { ////NOT WORKING
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});
    
//user login route (just email)
app.post("/login", (req, res) => {
  if (!emailLookUp(req.body.email) || !passwordLookup(req.body.password)) {
    res.redirect(403,'/login');
  } else if (!req.body.email || !req.body.password) {
    res.redirect(403,'/login');
  } else {
    let user = getByUserEmail(req.body.email);
    res.cookie("user_id",user.id);
    res.redirect("/urls");
  }
});

//----------------------------------------------------------------------------------

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_register", templateVars);
});

//----------------------------------------------------------------------------------
    
app.listen(PORT, () => {
  console.log(`TinyAapp listening on port ${PORT}!`);
});