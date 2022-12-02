const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, urlsForUser, urlAccessDenied } = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// structure of users -> id : {id, email, password : hashedPassword}
const users = {}; 
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

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["someSecretKey", "AnotherSecretKey"]}));

//urls homepage, displaying urls only if user is logged in
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  if (id === undefined) {
    res.redirect("/login");
    return;
  }
  const templateVars = { urls : urlsForUser(id, urlDatabase), user : users[id]};
  res.render("urls_index", templateVars);
});

//adding new url
app.post("/urls", (req, res) => {
  const id = req.session.user_id;
  if (id === undefined) {
    res.send("Error: please sign in first");
    return;
  }
  const longURL = req.body.longURL;
  urlDatabase[generateRandomString()] = { longURL : longURL, userID : id};
  res.redirect(longURL); 
});

//create new url
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  if (id === undefined) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    user : users[id]
  };

  res.render("urls_new", templateVars);
});


//register page
app.get("/register", (req, res) => {
  const id = req.session.user_id;
  if (id !== undefined) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user : users[id]
  };
  res.render("urls_register", templateVars);
});

//registering new user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password); //default round = 10

  if (email === "" || password === "") {
    res.status(400).send("empty email/password!");
    return;
  } else if (getUserByEmail(email, users) !== null) {
    res.status(400);
    res.send("This email has been registered!");
    return;
  }
  const id = generateRandomString();
  users[id] = { id, email, password : hashedPassword };
  req.session.user_id = id;
  res.redirect("/urls");
  
});

//login page
app.get("/login", (req, res) => {
  const id = req.session.user_id;
  if (id !== undefined) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user : users[id]
  };
  res.render("urls_login", templateVars);
});

//check if login was successful
app.post("/login", (req, res) => {
  const email = req.body.email;
  const inputPassword = req.body.password;
  const user = getUserByEmail(email, users);
  if (user === null) {
    res.status(403).send("User cannot be found");
    return;
  }
  const hashedPassword = user.password;
  if (!bcrypt.compareSync(inputPassword, hashedPassword)) {
    res.status(403).send("Invalid password");
    return;
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//delete url
app.post("/urls/:id/delete", (req, res) => {
  const url_id = req.params.id;
  const user_id = req.session.user_id;
  if (user_id === undefined) {
    //user not longged int
    res.send("Error: please login first!");
    return;
  } else if (urlDatabase[url_id] === undefined) {
    //id doesn't exist
    res.send("Error: url id does not exist");
    return;
  } else if (urlAccessDenied(url_id, user_id, urlDatabase)) {
    //user doens't own url
    res.send("Error: You don't have permission to delete this url");
    return;
  }
  delete urlDatabase[url_id];
  res.redirect("/urls");
});

//url detail page
app.get("/urls/:id", (req, res) => {
  const url_id = req.params.id;
  const user_id = req.session.user_id;
  if (user_id === undefined) {
    res.send("Error message: user not logged in");
    return;
  } else if (urlAccessDenied(url_id, user_id, urlDatabase)) {
    //url saved by other user
    res.send("Error: you don't have permission to view this url");
    return;
  } else if (urlDatabase[url_id] === undefined) {
    //invalid url
    res.send("Error: url id does not exist");
    return;
  }
  const templateVars = {id : url_id, longURL : urlDatabase[url_id]["longURL"], user : users[user_id] };
  res.render("urls_show", templateVars);
});

//edit
app.post("/urls/:id", (req, res) => {
  const url_id = req.params.id;
  const user_id = req.session.user_id;

  if (user_id === undefined) {
    //user not longged int
    res.send("Error: please login first!");
    return;
  } else if (urlDatabase[url_id] === undefined) {
    //id doesn't exist
    res.send("Error: url id does not exist");
    return;
  } else if (urlAccessDenied(url_id, user_id, urlDatabase)) {
    //user doens't own url
    res.send("Error: You don't have permission to edit this url");
    return;
  }

  const longURL = req.body.longURL;
  urlDatabase[url_id] = {longURL, userID : user_id};
  res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});