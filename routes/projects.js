var express = require('express');
var routerProject = express.Router();
var routerTask = express.Router();

routerProject.get('/', function(req, res, next) {
  // retourne tous les projets
});

//création et modification d'un projet
//l'id du créateur du projet vient de RmQ
routerProject.get("/:id",function(req, res, next) {
  //envoyer le projet
  console.log("get Project");
});
routerProject.put("/:id",function(req, res, next) {
  //modifier le projet
  console.log("put Project");
});

//permet de récupérer toutes les taches
routerTask.get("/",function(req, res, next){
  console.log("get All Task");
});

routerTask.post("/new", function(req, res, next){
  console.log("create a new task")
})

routerTask.get("/:id",function(req, res, next){
  console.log("get one task");
});
routerTask.put("/:id",function(req, res, next){
  console.log("put one task");
});
routerTask.delete("/:id",function(req, res, next){
  console.log("delete one task");
});

routerProject.use("/:project_id/tasks", routerTask);
module.exports = routerProject;
