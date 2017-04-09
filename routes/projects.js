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
      res.type("raw");
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
      project.findAll({
        where:{
          id: user.id
        },
        attributes:{
          exclude:["createdAt","updatedAt"]
        }
      }).then(function(resultat){
        console.log(resultat);
      })
    }

    console.log("Cette utilisateur n'existe pas");
  })


  res.end();
});
routerProject.put("/:id",function(req, res, next) {
  //modifier le projet
  console.log("put Project");
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
