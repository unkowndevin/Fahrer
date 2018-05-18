"use strict";

//modulos escenciales
const express = require('express');
const servidor = express();
const body_parser = require('body-parser');

//modulos utiles
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore= require('connect-mongo')(session);

//modulos propios
const Enrutador= require(path.join(__dirname,"routes","router.js"));
const router = new Enrutador(__dirname);
const MongooseControl = require(path.join(__dirname,"useful","mongoose.js"));
const db = new MongooseControl("Writer", "mQOKTTsSkN77aKit", "pruebassessiones");
db.con();

//variables utiles
const puerto = process.env.PORT || 3000;

//configuracion de express
servidor.use(body_parser.json());
servidor.use(body_parser.urlencoded({ extended : false }));
servidor.use(cookieParser());
servidor.use(session({
  secret: "Esto es un secreto",
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    mongooseConnection: db.getConnection()
  })
}));

servidor.use(express.static(path.join(__dirname,"public","dist")));
servidor.use("/undevin/docs/",express.static(path.join(__dirname,"sources")));

servidor.use("/", router.getRouter());

servidor.listen(puerto, function(){
  console.log("Servidor en el puerto ",puerto);
});

