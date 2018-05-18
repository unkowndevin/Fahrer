"use strict";

//modulos escenciales
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = Promise;

const UserSchema = new Schema({
  usu_name: { type : String, required : [true, "No olvides tu Nombre"]},
  usu_last_name: { type : String, required : [true, "No olvides tus apellidos"]},
  usu_nick_name: { type : String, required : [true, "Tu nombre de usuario es importante, no lo olvides!"], unique : true},
  usu_email: { type : String, required : [true, "Necesitas registrar tu correo para iniciar sesion"], unique : true},
  usu_password: { type : String, required : [true, "Necesitas una contraseña para iniciar sesión"]},
  usu_birth_date: { type : String, required : [true, "No olvides tu fecha de nacimiento"] },
  usu_place: { type : String, required : [true, "No olvides seleccionar tu país"] },
  usu_genre: { type : String, enum: { values: ["Hombre","Mujer"], message:"Escoge tu sexo biologico, ya sea Hombre o Mujer"},required : [true, "Debes seleccionar un sexo"] },
  usu_privilege: { default : 0,type : Number, required : true },
  usu_created_date: { default : new Date(),type : Date, required : true },
  usu_update_date: { default : new Date(),type : Date, required : true },
  usu_last_visit: { default : new Date(),type: Date, required : true }
});

//ejecucion antes de cualquier accion
UserSchema.pre('save', function(next){
  let current = new Date();
  this.usu_update_date= current;
  if (!this.usu_created_date) {
    this.usu_created_date = current;
    this.usu_last_visit = current;
  }
  next();
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
