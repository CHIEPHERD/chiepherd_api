"use strict"
let models = require('../../models');
let users = models.users;

describe("users model",function(){
  it("create a null model", function(){
    users.create({
      email: "email",
      password: "password"
    }).then(function(user) {
      expect(user).not.toEqual({
        email:"email",
        password:"password"
      });

      console.log(user);
    })
  });
});

function HelloWorld()
{
  return "HelloWorld";
}

describe("HelloWorld",function(){
  it("hey hello success", function(){
    expect(HelloWorld()).toEqual("HelloWorld");
  });

  it("hey hello not success", function(){
    expect(HelloWorld()).not.toEqual("HelloWorld");
  });
});
