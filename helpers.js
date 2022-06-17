const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user]['email'] === email) {
      return database[user];
    }
  }
  return null;
};

const findURLsById = function(userId, database) {
  let urlDatabaseById = {};
  for (let url in database) {
    if (database[url].userID === userId) {
      urlDatabaseById[url] = database[url];
    }
  }
  return urlDatabaseById;
};

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * 62));
  }
  return result;
};

module.exports = {
  getUserByEmail,
  findURLsById,
  generateRandomString
};