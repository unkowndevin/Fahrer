"use strict";

const mongoose = require('mongoose');
mongoose.Promise = Promise;

class MongooseControl{
  constructor(userName, userPassword, database){
    this.userName = userName;
    this.userPassword = userPassword;
    this.database = "pruebas" || database;
    this.db = mongoose;
  }

  setUser(newUserName, newPassword){
    this.userName = newUserName;
    this.userPassword = newPassword;
  }

  setDatabase(newDatabase){
    this.database = newDatabase;
  }

  con(){
    this.db.connect(`mongodb://${this.userName}:${this.userPassword}@undevin-shard-00-00-mpd3g.mongodb.net:27017,undevin-shard-00-01-mpd3g.mongodb.net:27017,undevin-shard-00-02-mpd3g.mongodb.net:27017/${this.database}?ssl=true&replicaSet=undevin-shard-0&authSource=admin`).then(function(){}).catch(function(err){
        console.log("Error al hacer la conexion con MongoDB, ",err.message);
    });
  }

  dis(){
    this.db.disconnect();
  }

  getConnection(userName, userPassword, database){
    return this.db.connection;
  }

  destroy(){
    this.userName = "";
    this.userPassword = "";
    this.database = "";
    this.db = null;
  }

}

module.exports = MongooseControl;
