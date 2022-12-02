
const generateRandomString = () => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = '';

  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  } 
  return result;
};

const getUserByEmail = (newEmail, database) => {
  for (const id in database) {
    if (database[id].email === newEmail) {
      return database[id];
    }
  }
  return null;
};

const urlsForUser = (id, database) => {
  let urls = {};
  for (const key in database) {
    const userID = database[key].userID;
    if (userID === id) {
      urls[key] = database[key].longURL;
    }
  }
  return urls;
};

const urlAccessDenied = (id, user_id, database) => {
  //id is the url id
  //return true if u don't have permission to this url
  const urls = urlsForUser(user_id, database);
  //user doesn't have url saved in this id
  const condition1 = !Object.keys(urls).includes(id);
  //this id is in urlDatabase under other user_id
  const condition2 = Object.keys(database).includes(id);
  return condition1 && condition2;
};


module.exports = { getUserByEmail, urlsForUser, urlAccessDenied, generateRandomString };