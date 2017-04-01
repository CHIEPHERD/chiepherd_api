# chiepherd_api

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
