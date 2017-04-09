"use strict";

var express = require('express');
var routerProject = express.Router();
var routerTask = express.Router();

//var models = require("../models");

routerProject.get('/', function(req, res, next) {
  // retourne tous les projets
  let allProject = projects.findAll()
    .then(console.log(allProject));
  res.status = 200;

});

//création et modification d'un projet
//l'id du créateur du projet vient de RmQ
routerProject.get("/:id",function(req, res, next) {
  //envoyer le projet
  let id = req.params.id;
  console.log("get Project " + id);
  
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
