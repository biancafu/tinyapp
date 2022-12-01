const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
//can put a callback function and it would run each time a route gets called

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = {urls : urlDatabase, user : users[id]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = {
    user : users[id]
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  console.log("going to register page");
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || !password === "") {
    res.status(400);
    res.send("empty email/password!")
  }
  if (checkEmail(email) !== null) {
    res.status(400);
    res.send("This email has been registered!");
  }
  const id = generateRandomString();
  users[id] = { id, email, password };
  console.log("new user: ", users[id]);
  res.cookie("user_id", id);
  res.redirect("/urls");
  
});

app.post("/login", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  console.log("login as", user);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  console.log("logout as", user);
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const longURL = req.body.longURL;
  urlDatabase[generateRandomString()] = longURL;
  res.redirect(longURL); 
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  console.log("deleting", id, urlDatabase[id]);
  delete urlDatabase[id];
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  console.log("new URL:", req.body);
  const longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const uesr_id = req.cookies["user_id"];
  const templateVars = {id : req.params.id, longURL : urlDatabase[req.params.id], user : users[user_id] };
  res.render("urls_show", templateVars);
})

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!", users };
  res.render("hello_world", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = '';

    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    } 
    return result;
};

const checkEmail = (newEmail) => {
  for (const user in users) {
    if (users[user].email === newEmail) {
      return user;
    }
  }
  return null;
};