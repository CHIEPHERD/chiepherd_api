"use strict";
var express = require('express');
var bodyParser = require('body-parser');
var sequelize = require("sequelize");

var routerProject = express.Router();
var routerTask = express.Router();

routerProject.use(bodyParser.json());

var models = require("../models");
var project = models.project;
var users = models.users;

routerProject.get('/', function(req, res, next) {
  // retourne tous les projet
  project.findAll({
    attributes:{
      exclude:["createdAt","updatedAt"]
    }
  }).then(function(result){
    console.log(result);
    res.type("json");
    res.send(result);
    res.status = 200;
  });
});

//création et modification d'un projet
//l'id du créateur du projet vient de RmQ
routerProject.get("/:id",function(req, res, next) {
  let id = req.params.id;

  users.findOne({
    where:{
      id: id
    },
    attributes:{
      exclude:["createdAt","updatedAt"]
    }
  }).then(function(user){
    if(user != null)
    {
    }
    console.log("user doesn't exsit");

  });


  res.end();
});
routerProject.put("/:id",function(req, res, next) {
  //modifier le projet
  let id = req.params.id;

  console.log("put Project");
  let projectName = req.body.name;
  let projectlabel = req.body.label;

  users.findOne({
    where:{
      id: id
    },
    attributes:{
      exclude:["createdAt","updatedAt"]
    }
  })
  .then(function(user){ //Pas intermédiaire pour tester
    if(user != null)
    {
      console.log(user);
    }
    else {
      console.log("Cette utilisateur n'existe pas");
      users.create({
        email: "toto@mail.com",
        password: "test"
      }).then(function(result){
        console.log(result);
      });
      console.log("utilisateur de test créée");
    }
    return user;
  })
  .then(function(user){
    console.log("UserOk");

    project.create({
      name: projectName,
      label: projectlabel
    }).then(function(project){
      console.log("Project created");

      user.addProject([project])
      .then(function()
      {
        console.log("allGood");
      });
    });
    res.status("200");
  });
  res.end();

});

//permet de récupérer toutes les taches

routerTask.get("/",function(req, res, next){
  console.log("get All Task");
  res.end();

});

routerTask.post("/new", function(req, res, next){
  console.log("create a new task")
  res.end();
})

routerTask.get("/:id",function(req, res, next){
  console.log("get one task");
  res.end();
});
routerTask.put("/:id",function(req, res, next){
  console.log("put one task");
  res.end();
});
routerTask.delete("/:id",function(req, res, next){
  console.log("delete one task");
  res.end();
});

routerProject.use("/:project_id/tasks", routerTask);
module.exports = routerProject;
