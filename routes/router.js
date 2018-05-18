"use strict";

//modulos escenciales
const express = require('express');

//modulos utiles
const path = require('path');
const DataBaseMethods = require('../useful/db_methods.js');
const DialogFlow = require('../useful/dialogflow');

//rutas
class Enrutador{
  constructor(dirname){
      this.router = express.Router();
      this.dirname = dirname;
      this.rutas();
  }

  rutas(route = "/undevin//"){
    this.router.get("/[a-zA-z]+(?=[/]?)", (rq, rs) => {
      rs.sendFile(path.join(this.dirname,"public","dist","index.html"));
    });
    this.router.get("/undevin/:type(inicio*|conocenos*|nuestro%2Bproyecto*)", (rq, rs) => {
      rs.sendFile(path.join(this.dirname,"public","dist","index.html"));
    });
    this.router.get("/undevin/:type(admin*)", (rq, rs) => {
      if(rq.session.data && rq.session.data.privilege>0){
        rs.sendFile(path.join(this.dirname,"public","dist","index.html"));
      }else{
        rs.redirect("/undevin/");
      }
    });
    this.router.get("/dev/:type(entra*|registrate*)", (rq, rs) => {
      if(rq.session.data && rq.session.data.privilege>=0){
        rs.redirect("/undevin/usuario");
      }else{
        rs.sendFile(path.join(this.dirname,"public","dist","index.html"));
      }
    });
    this.router.get("/undevin/:type(cuenta*|diagnostico*)", (rq, rs) => {
      if(rq.session.data && rq.session.data.privilege>=0){
        rs.sendFile(path.join(this.dirname,"public","dist","index.html"));
      }else{
        rs.redirect("/undevin/inicio");
      }
    });
    this.router.get(`${route}/view`, (rq, rs) => {
      rs.sendFile(path.join(this.dirname,"views","index.html"));
    });
    this.router.get(`${route}/sesion`, (rq, rs) => {
      if(rq.session.data){
        rs.json({
          status: 200,
          message: rq.session.data.privilege
        });
      }else{
        rs.json({
          status: 505,
          message: -1
        });
      }
    });
    this.router.post(`${route}/registrar`, (rq, rs) => {
      let user = {};
      for(let key in rq.body){
        user["usu_"+key]=rq.body[key];
      }
      let db = new DataBaseMethods();
      db.saveUser(user).then( response => {
        db.destroy();
        rs.json(response);
      });
    });
    this.router.get(`${route}/usuarios`, (rq, rs) => {
      let db = new DataBaseMethods();
      if(rq.session.data && rq.session.data.privilege>0){
        db.findAll().then( response => {
          db.destroy();
          rs.json({ rs: response});
        });
      }else{
        rs.json({
          rs: {
            status: 500,
            message: "No puede hacer eso"
          }
        });
      }
    });
    this.router.post(`${route}/eliminar`, (rq, rs) => {
      if(rq.session.data && rq.session.data.privilege>0){
        let db = new DataBaseMethods();
        db.deleteUser( rq.body.id ).then( response => {
          db.destroy();
          rs.json({
            rs: response
          });
        });
      }else{
        rs.json({
          rs: {
            status: 505,
            message: "No haz iniciado sesion"
          }
        });
      }
    });
    this.router.post(`${route}/actualizar`, (rq, rs) => {
      if(rq.session.data){
        let db = new DataBaseMethods();
        let user = {};
        for(let key in rq.body){
          user["usu_"+key]=rq.body[key];
        }
        db.updateUser( user, rq.session.data.id ).then( response => {
          db.destroy();
          rs.json(response);
        });
      }else{
        rs.json({
          rs: {
            status: 505,
            message: "No haz iniciado sesion"
          }
        })
      }
    });
    this.router.get(`${route}/perfil`, (rq, rs) => {
      if(rq.session.data){
        let db = new DataBaseMethods();
        db.findOne( rq.session.data.id ).then( response => {
          db.destroy();
          rs.json(response);
        });
      }else{
        rs.json({
            status: 505,
            message: "No haz iniciado sesion"
          });
      }
    });
    this.router.post(`${route}/login`, (rq, rs) => {
      let db = new DataBaseMethods();
      db.authenticateUser( rq.body.email, rq.body.password).then( response => {
        if(response.status == 200){
          if(response.message.auth){
            rq.session.data = {
              id: response.message.id,
              nick_name: response.message.nick_name,
              privilege: response.message.privilege
            };
            db.findOne(response.message.id).then( data => {

              if(rq.body.mobile){
                rs.json({
                  status: 200,
                  message: data,
                  sessionID: rq.sessionID
                });
              }else{

                rs.json(data);

              }

            });
          }else{
            rs.json({
              status: 504,
              message: "Contraseña incorrecta"
            });
          }
        }else{
          rs.json(response);
        }
      })
    });
    this.router.post(`${route}/password`, (rq, rs) => {
      if(rq.session.data){
        let db = new DataBaseMethods();
        db.changePassword(rq.session.data.id, rq.body.oldPassword, rq.body.newPassword).then( response => {
          db.destroy();
          rs.json(response);
        });
      }else{
        rs.json({
          rs: {
            status: 505,
            message: "No haz iniciado sesion"
          }
        });
      }
    });
    this.router.get(`${route}/stats`, (rq, rs) => {
      let db = new DataBaseMethods();
      if(rq.session.data && rq.session.data.privilege > 0){
        db.usersStats().then( response => {
          db.destroy();
          rs.json({
            rs: response
          });
        });
      }else{
        rs.json({
          status: 500,
          message: "No puede hacer eso"
        });
      }
    });
    this.router.get(`${route}/paises`, (rq, rs) => {
      let db = new DataBaseMethods();
      db.findPlaces().then( response => {
        db.destroy();
        rs.json(response);
      });
    });
    this.router.post(`${route}/pais`, (rq, rs) => {
      let db = new DataBaseMethods();
      if(rq.session.data && rq.session.data.privilege > 0){
        let place = {
          abbr: rq.body.abbr,
          name: rq.body.name
        };
        db.saveOnePlace(place).then( response => {
          db.destroy();
          rs.json({
            rs: response
          });
        });
      }else{
        rs.json({
          status: 500,
          message: "No puede hacer eso"
        });
      }
    });
    this.router.get(`${route}/logout`, (rq, rs) => {
      rq.session.destroy( err => {});
      rs.json({
        rs: {
          status: 200,
          message: "Session cerrada"
        }
      });
    });
    this.router.post(`${route}/diagnostic`, (rq, rs) => {
      
      if(!rq.session.results){
        rq.session.results = {
          begin: new Date(),
          end: null,
          finalDuration: 0.0,
          persistence: {
            estimated: null,
            received: "",
            note: ""
          },
          messages: [],
          messagesCount: 0,
          messagesDistribution: {},
          highlightMessages: [],
          highlightWords: [],
          severity:{
            low: 0,
            medium: 0,
            high: 0
          },
          conclusions: ""
        }
      }

      let dialogflow = new DialogFlow(
        rq.body.mobile ? rq.body.sessionID:rq.sessionID)

      dialogflow.sendMessage(rq.body.message).then(response => {

        rq.session.results.begin = 
            (response.begin || rq.session.results.begin);
        rq.session.results.end = 
            (response.end || rq.session.results.end);
        rq.session.results.persistence = 
            (response.persistence || rq.session.results.persistence);
        rq.session.results.messages.push(response.message);
        rq.session.results.messagesCount = rq.session.results.messages.length;
        if(response.highlight){rq.session.results.highlightMessages.push(response.speech)}
        if(response.highlightWord){rq.session.results.highlightWords.push(response.words)}
        rq.session.results.severity.low += response.severity.low;
        rq.session.results.severity.medium += response.severity.medium;
        rq.session.results.severity.high += response.severity.high;

        if(response.end){
          rq.session.results.finalDuration = 
            (rq.session.results.end.getTime()-rq.session.results.begin.getTime())/(1000*60) 
        }

        rs.json({
          status: 200,
          speech: response.speech,
          end: response.end
        })

      }).catch(err => {

        rs.json(err);

      });

    });

    this.router.get(`${route}/results`, (rq, rs) =>{

      if(rq.session.results){
        rs.json({
          status: 200,
          results: rq.session.results
        })
      }else{
        rs.json({
          status: 505,
          results: "No hay resultados que mostrar"
        })
      }

    });



  }

  getRouter(){
    return this.router;
  }

  getDirname(){
    return this.dirname;
  }

}
module.exports = Enrutador;
