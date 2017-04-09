var assert = require("assert");
var User = require('../../models').users;

module.exports = describe('Model user', function() {
  it('should create new users', function() {
    // Creation
    console.log("User.user");
    user = User.create({
      email: 'test@chiepherd.com',
      password: 'password'
    })

    test = null
    User.findAll().then(function(e){ console.log("hahaha"); })
    // Assert
    console.log(test);
    // .exec(function (err, results) {
    //   assert.equal(results.length, 1)
    // });
  })
})
