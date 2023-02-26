//generated random string of six numbers and letters
const generateRandomString = () => {
  return Math.random().toString(36).substring(3, 9);
};

///looks up user in database using email and returns matching ID
const getByUserEmail = (email, userDatabase) => {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

//checks if email matches user in database
const emailHasUser = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
};

//Checks if current cookie corresponds with a user in database
const cookieIsCurrentUser = (cookie, userDatabase) => {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
};

//checks if URLs' useriD matches the currently logged in user
const urlsforUser = (id, urlDatabase) => {
  const result = {};
  for (const tinyURL in urlDatabase) {
    if (urlDatabase[tinyURL].userID === id) {
      result[tinyURL] = urlDatabase[tinyURL];
    }
  }
  return result;
};

module.exports = { generateRandomString, getByUserEmail, emailHasUser, cookieIsCurrentUser, urlsforUser };