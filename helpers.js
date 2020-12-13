
// FUNCTION TO CHECK IF email exist
const getUserByEmail = function(email, users) {
  //let ID ='';
  for (const user in users) {
    
    if (users[user].email === email) {
      return user;
    }
  }  
  return null;
};

module.exports = {getUserByEmail};