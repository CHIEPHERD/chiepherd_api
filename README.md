# chiepherd_api

## Infos pratique
Pour taper dans l'api, utiliser 192.168.56.103:3000

---
## Routing keys

### Pojects
- chiepherd.project.create
- chiepherd.project.update
- chiepherd.project.show
- chiepherd.project.tasks
- chiepherd.project.list

### Tasks
- chiepherd.task.create
- chiepherd.task.update
- chiepherd.task.show
- chiepherd.task.delete

### Users
- chiepherd.user.update
- chiepherd.user.show
- chiepherd.user.list
- chiepherd.user.activate
- chiepherd.user.reset_password

### Project Assignments
- chiepherd.project.users
- chiepherd.user.projects
- chiepherd.project_assignment.create
- chiepherd.project_assignment.update
- chiepherd.project_assignment.delete

### Task Assignments
- chiepherd.task_assignment.create
- chiepherd.task_assignment.delete
- chiepherd.task.users
- chiepherd.user.tasks

---
## Description
Cette API est le bloc principal de la solution logicielle. Elle permet en effet la gestion des tâches, des projets, et celle des utilisateurs.

De nouveaux utilisateurs peuvent rejoindre le système, éditer leur profile, ou même supprimer leur compte.

Un utilisateur peut créer un projet et en devenir le Lead. Il dispose alors des droits permettant de modifier les paramètres du projet, telle que sa description, sa visibilité, etc.

Il peut décider d’affecter d’autres utilisateurs au projets sous différents rôles : Lead Developer, Scrum Master, développeur ou Product Owner. Un administrateur logiciel ne peut pas être affecté pour des raisons de sécurités. Il doit donc se créer un compte avec moins de droits pour manager un projet avec son propre logiciel.

L’API permet la création de tasks de plusieurs niveaux :
Epic
Rendu
User story
Tâche
Theme

Une tâche est caractérisée par l’un des types suivants :
Chore
Feature
Issue

Une tâche peut être affectée à un ou plusieurs utilisateurs.

La technologie utilisée pour cette API est Node.
