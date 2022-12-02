const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user object when the input email exists in the input database', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    assert.deepEqual(user, {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    });
  });
  it('should return null when the input email does not exist in the input database', function() {
    const user = getUserByEmail("u@example.com", testUsers)
    assert.isNull(user, "there is no such user");
  });
});