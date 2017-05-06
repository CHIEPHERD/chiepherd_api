"use strict"
function HelloWorld()
{
  return "Hello World";
}

describe("Hello World",function(){
  it("says Hello", function(){
    expect(HelloWorld()).toEqual("Hello World");
  });
});
