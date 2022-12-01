const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

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

//homepage, displaying urls
app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  if (id === undefined) {
    res.send("Error: user not logged in");
    return;
  }
  const templateVars = { urls : urlsForUser(id), user : users[id]};
  console.log(urlsForUser(id));
  res.render("urls_index", templateVars);
});

//adding new url
app.post("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  if (id === undefined) {
    console.log("please sign in first");
    res.send("Error: please sign in first");
    return;
  }
  console.log(req.body); // Log the POST request body to the console
  const longURL = req.body.longURL;
  urlDatabase[generateRandomString()] = { longURL : longURL, userID : id};
  res.redirect(longURL); 
});

//create new url
app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = {
    user : users[id]
  };
  if (id === undefined) {
    console.log("please login first (get)");
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});


//register page
app.get("/register", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = {
    user : users[id]
  };
  if (id !== undefined) {
    console.log("already registered");
    res.redirect("/urls");
    return;
  }
  console.log("going to register page");
  res.render("urls_register", templateVars);
});

//registering new user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || !password === "") {
    res.status(400).send("empty email/password!");
    return;
  } else if (getUserByEmail(email) !== null) {
    res.status(400);
    res.send("This email has been registered!");
    return;
  }
  const id = generateRandomString();
  users[id] = { id, email, password };
  console.log("new user: ", users[id]);
  res.cookie("user_id", id);
  res.redirect("/urls");
  
});

//login page
app.get("/login", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = {
    user : users[id]
  };
  if (id !== undefined) {
    console.log("already signed in");
    res.redirect("/urls");
    return;
  }
  res.render("urls_login", templateVars);
});

//check if login was successful
app.post("/login", (req, res) => {
  const email = req.body.email;
  const inputPassword = req.body.password;
  const user = getUserByEmail(email);
  console.log(user);
  if (user === null) {
    res.status(403).send("User cannot be found");
    return;
  } else if (user.password !== inputPassword) {
    res.status(403).send("Invalid password");
    return;
  }
  console.log("login as", email, "password", inputPassword);
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  console.log("logout as", user);
  res.clearCookie("user_id");
  res.redirect("/login");
});


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user_id = req.cookies["user_id"];
  if (user_id === undefined) {
    //user not longged int
    res.send("Error: please login first!");
    return;
  } else if (urlDatabase[id] === undefined) {
    //id doesn't exist
    res.send("Error: id does not exist");
    return;
  } else if (urlAccessDenied(id, user_id)) {
    //user doens't own url
    res.send("Error: You don't have permission to delete this url");
    return;
  }
  console.log("deleting", id, urlDatabase[id]);
  delete urlDatabase[id];
  res.redirect("/urls");
});

//edit
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  console.log("new URL:", req.body);
  const longURL = req.body.longURL;
  urlDatabase[id] = {longURL, userID : req.cookies["user_id"]};
  res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.cookies["user_id"];
  const urls = urlsForUser(user_id);
  if (user_id === undefined) {
    res.send("Error message: user not logged in");
    return;
  } else if (urlAccessDenied(id, user_id)) {
    //url saved by other user
    res.send("You don't have permission to view this url");
    return;
  } else if (urlDatabase[id] === undefined) {
    //invalid url
    res.send("Error: id does not exist");
    return;
  }
  const templateVars = {id : id, longURL : urlDatabase[id]["longURL"], user : users[user_id] };
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

const getUserByEmail = (newEmail) => {
  for (const id in users) {
    if (users[id].email === newEmail) {
      return users[id];
    }
  }
  return null;
};

const urlsForUser = (id) => {
  let urls = {};
  for (const key in urlDatabase) {
    const userID = urlDatabase[key].userID;
    if (userID === id) {
      urls[key] = urlDatabase[key].longURL;
    }
  }
  return urls;
};

const urlAccessDenied = (id, user_id) => {
  //return true if u don't have permission to this url
  const urls = urlsForUser(user_id);
  //user doesn't have url saved in this id
  const condition1 = !Object.keys(urls).includes(id);
  //this id is in urlDatabase under other user_id
  const condition2 = Object.keys(urlDatabase).includes(id);
  return condition1 && condition2;
}