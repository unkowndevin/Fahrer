"use strict";

//modulos escenciales
const BluebirdPromise = require("bluebird");
const bcrypt = BluebirdPromise.promisifyAll(require('bcrypt-nodejs'));
const User = require('../models/user');
const Place = require("../models/place");
const MongooseControl = require('./mongoose.js');

class DataBaseMethods {
  constructor(user){
    this.user = new User(user);
    this.databaseName = "pruebas";
  }

  saveUser(user){
    this.user = new User(user);
    return this.getPlaceIdByAbbr(this.user.usu_place).then( placeId => {
      this.user.usu_place = placeId;
      return bcrypt.genSaltAsync(10).then(salt => {
        return bcrypt.hashAsync(this.user.usu_password, salt, null).then( hash => {
          this.user.usu_password = hash;
          this.db = new MongooseControl("Writer", "mQOKTTsSkN77aKit", this.databaseName);
          this.db.con();
          return this.user.save().then( user => {
                  this.db.dis();
                  return { status: 200, message: "Registro Exitoso"};
                }).catch( err => {
                  this.db.dis();
                  let errorMessage = {};
                  if(err.name=="MongoError"){
                    if(err.code==11000){
                      if(err.message.indexOf("email")>0){
                        errorMessage = {
                          email: "El correo eletrónico que intentas registrar ya existe"
                        };
                      }else{
                        errorMessage = {
                          nick_name: "El nombre de usuario que intentas registrar ya existe"
                        };
                      }
                    }else{
                      errorMessage = {
                        message:err.message
                      }
                    }
                  }else{
                    for(let error in err.errors){
                      errorMessage[error.replace("usu_","")]=err.errors[error].message;
                    }
                  }
                  return { status: 501, message: errorMessage };
            });
        });
      });
    }).catch( err => {
      return {
        status: 502,
        message: {
          place: `Selecciona un país entre las opciones`
        }
      };
    });
  }

  findAll(){
    this.db = new MongooseControl("Reader", "BGqs3qOdDJARWwJr", this.databaseName);
    this.db.con();
    return User.find({ usu_privilege: 0 }, "_id usu_nick_name usu_created_date usu_update_date usu_privilege").then( users => {
      this.db.dis();
      return {
        status: 200,
        message: users.map( (user, id) => {
          let created_date = user.usu_created_date;
          let update_date = user.usu_update_date;
          let privilege = "";
          switch (user.usu_privilege) {
            case 1:
              privilege = "Administrador de Usuarios";
              break;
            case 2:
              privilege = "Administrador Root";
              break;
            default:
              privilege = "Usuario";
          }
          return {
            num: id+1,
            id: user._id,
            nick_name: user.usu_nick_name,
            created_date: created_date,
            update_date: update_date,
            privilege: privilege,
            password: user.usu_password
          }
        })
      };
    }).catch( err => {
      this.db.dis();
      return {
        status: 500,
        message: err.message
      };
    });
  }

  deleteUser(userID){
    this.db = new MongooseControl("Writer", "mQOKTTsSkN77aKit", this.databaseName);
    this.db.con();
    return User.findByIdAndRemove(userID).then( () => {
      this.db.dis();
      return { status: 200, message: "Eliminado con exito" };
    }).catch( err => {
      this.db.dis();
      return { status: 500, message: "No se encontró el usuario que intenta eliminar" };
    })
  }

  updateUser(user, id){
    this.db = new MongooseControl("Writer", "mQOKTTsSkN77aKit", this.databaseName);
    this.db.con();
    let newUser = user;
    newUser.usu_update_date = new Date();
    for(let key in newUser){
      if (newUser[key]==""){
        delete newUser[key];
      }
    }
    if(newUser.usu_place){
      return this.getPlaceIdByAbbr(newUser.usu_place).then( id => {
        this.db = new MongooseControl("Writer", "mQOKTTsSkN77aKit", this.databaseName);
        this.db.con();
        newUser.usu_place = id;
        return User.findByIdAndUpdate(id, { $set: newUser}, { new: true, runValidator: true }).then( user => {
          this.db.dis();
          return { status: 200, message: "Se actualizaron tu datos de forma correcta" };
        }).catch( err => {
          this.db.dis();
          let errorMessage = {};
          if(err.name=="MongoError"){
            
            if(err.code==11000){
              if(err.message.indexOf("email")>0){
                errorMessage = {
                  email: "El correo eletrónico que intentas registrar ya existe"
                };
              }else{
                errorMessage = {
                  nick_name: "El nombre de usuario que intentas registrar ya existe"
                };
              }
            }else{
              errorMessage = {
                message:err.message
              }
            }
          }else{
            for(let error in err.errors){
              errorMessage[error.replace("usu_","")]=err.errors[error].message;
            }
          }
          return { status: 500, message: JSON.stringify(errorMessage)};
        });
      }).catch( err => {
        return {
          status: 500,
          message: `Ese pais no esta registrado`
        };
      });
    }else{
      this.db = new MongooseControl("Writer", "mQOKTTsSkN77aKit", this.databaseName);
      this.db.con();
      return User.findByIdAndUpdate(id, { $set: newUser}, { new: true, runValidator: true }).then( user => {
        this.db.dis();
        return { status: 200, message: "Actualizacion Realizada con exito" };
      }).catch( err => {
        this.db.dis();
        let errorMessage = {};
        if(err.name=="MongoError"){
          if(err.code==11000){
            if(err.message.indexOf("email")>0){
              errorMessage = {
                email: "El correo eletrónico que intentas registrar ya existe"
              };
            }else{
              errorMessage = {
                nick_name: "El nombre de usuario que intentas registrar ya existe"
              };
            }
          }else{
            errorMessage = {
              message:err.message
            }
          }
        }else{
          for(let error in err.errors){
            errorMessage[error.replace("usu_","")]=err.errors[error].message;
          }
        }
        return { status: 500, message: JSON.stringify(errorMessage)};
      });
    }
  }

  findOne(id){
    this.db = new MongooseControl("Reader", "BGqs3qOdDJARWwJr", this.databaseName);
    this.db.con();
    return User.findById(id, "usu_name usu_last_name usu_email usu_nick_name usu_genre usu_birth_date usu_place").then( user => {
      this.db.dis();
      return this.getPlaceNameById(user.usu_place).then( name => {
        return {
          status: 200,
          message: {
            name: user.usu_name,
            last_name: user.usu_last_name,
            email: user.usu_email,
            nick_name: user.usu_nick_name,
            birth_date: user.usu_birth_date,
            place: name,
            genre: user.usu_genre
          }
        };
      }).catch( err => {
        return {
          status: 500,
          message: `Algo ha salido mal, ${err.message}`
        };
      });
    }).catch( err => {
      this.db.dis();
      return {
        status: 500,
        message: `Hubo un erro ${err.message}`
      };
    });
  }

  authenticateUser(email, password){
    this.db = new MongooseControl("Reader", "BGqs3qOdDJARWwJr", this.databaseName);
    this.db.con();
    return User.findOne({ usu_email: email}, "usu_password _id usu_nick_name usu_privilege").then( user => {
      this.db.dis();
      return bcrypt.compareAsync(password, user.usu_password).then( rs => {
        this.db.setUser("Writer", "mQOKTTsSkN77aKit");
        this.db.con();
        let current = new Date();
        return User.findByIdAndUpdate(user._id,
          { $set: { usu_last_visit: current } },
          { new: true, runValidator: true }).then( userLogged => {
            this.db.dis();
            return {
              status: 200,
              message: {
                auth: rs,
                id: user._id,
                nick_name: user.usu_nick_name,
                privilege: user.usu_privilege
              }
            };
          }).catch( err => {
            this.db.dis();
            return {
              status: 500,
              message: `Algo ha salido mal al actualizar tu ultima visita, ${err.message}`
            }
          });
      });
    }).catch( err => {
      this.db.dis();
      let errorMessage = err.message;
      if(errorMessage.indexOf("of null")>0){
        errorMessage = "El correo que haz ingresado no esta registrado";
      }
      return {
        status: 503,
        message: errorMessage
      };
    });
  }

  changePassword(id, oldPassword, newPassword){
    this.db = new MongooseControl("Reader", "BGqs3qOdDJARWwJr", this.databaseName);
    this.db.con();
    return User.findById(id, "usu_password").then( user => {
      this.db.dis();
      return bcrypt.compareAsync(oldPassword, user.usu_password).then( auth => {
        console.log(auth);
        if(auth){
          return bcrypt.genSaltAsync(10).then(salt => {
            return bcrypt.hashAsync(newPassword, salt, null).then( hash => {
              console.log(hash);
              this.db.setUser("Writer", "mQOKTTsSkN77aKit");
              this.db.con();
              return User.findByIdAndUpdate(id,
                { $set: { usu_password: hash } },
                { new: true, runValidator: true }).then( user => {
                  this.db.dis();
                  return {
                    status: 200,
                    message: "Contraseña cambiada exitosamente"
                  };
              }).catch( err => {
                this.db.dis()
                return {
                  status: 500,
                  message: `Algo mal ha salido mal al actualizar, ${err.message}`
                };
              });
            }).catch( err => {
              return {
                status: 506,
                message: `Algo ha salido mal haciendo el hash, ${err.message}`
              };
            });
          });
        }else{
          return {
            status: 500,
            message: "La contreña es incorrecta"
          };
        }
      }).catch( err => {
        return {
          status: 506,
          message: `Algo ha salido mal al comparar, ${err.message}`
        };
      });
    }).catch( err => {
      this.db.dis();
      return {
        status: 500,
        message: `Algo ha salido mal, ${err.message}`
      };
    });
  }

  usersStats(){
    this.db = new MongooseControl("Reader", "BGqs3qOdDJARWwJr", this.databaseName);
    this.db.con();
    return User.find({}, "usu_created_date usu_genre usu_place usu_birth_date usu_last_visit").then( users => {
      this.db.dis()
      let places = {};
      let genres = {};
      let ages = {};
      let a = users.map( user => {
        return this.getPlaceNameById(user.usu_place).then( name => {return name}).catch( err => {return "error"});
      });
      users.map( user => {
        let genre = user.usu_genre;
        genres[genre]=(genres[genre] || 0)+1;
        if(user.usu_birth_date){
          let birth_date = new Date(user.usu_birth_date);
          let birthYear = birth_date.getFullYear().toString();
          let birthYearString = `${String.prototype.slice.call(birthYear, 0, -1)}X`;
          let age = ages[birthYearString] || {};
          age[genre] = ( age[genre] || 0 ) + 1;
          ages[birthYearString] = age;
        }
      });
      let agesYears = Object.keys(ages);
      let agesData = (function(years, ages){
        let preparingData = {};
        ages.map( age => {
          if(Object.keys(age).length!=Object.keys(genres).length){
            for(let i in genres){
              age[i] = age[i] || 0;
            }
          }
          for (let key in age) {
            preparingData[key] ? preparingData[key].push(age[key]) : preparingData[key]=[age[key]];
          }
        });
        let data = Object.keys(preparingData).map( key => {
          return {
            data: preparingData[key],
            label: key
          };
        });
        return data;
      })(agesYears, Object.values(ages));
      return Promise.all(a).then( names => {
        names.map( name => {
          places[name]=(places[name] || 0) + 1;
        });
        return {
          places: {
            labels: Object.keys(places),
            data: Object.values(places)
          },
          genres: {
            labels: Object.keys(genres),
            data: Object.values(genres)
          },
          ages: {
            data: agesData,
            labels: agesYears
          },
          users: users.map( user => { return user.usu_created_date})
        };
      });
    }).catch( err => {
      return {
        status: 500,
        message: `Algo ha salido las con los stats, ${err.message}`
      };
    });
  }

  saveOnePlace(place){
    let placeSave = new Place(place);
    this.db = new MongooseControl("Writer", "mQOKTTsSkN77aKit", this.databaseName);
    this.db.con();
    return placeSave.save().then( place => {
      this.db.dis();
      return {
        status: 200,
        message: "Pais registrado exitosamente"
      };
    }).catch( err => {
      this.db.dis();
      return {
        status: 500,
        message: `No se ha registrado el pais, ${err.message}`
      };
    });
  }

  findPlaces(){
    this.db = new MongooseControl("Reader", "BGqs3qOdDJARWwJr", this.databaseName);
    this.db.con();
    return Place.find({}, "name abbr").then( places => {
      this.db.dis();
      if(places.length>0){
        return {
          status: 200,
          message: places
        };
      }else{
        return {
          status: 300,
          message: "No hay paises registrados"
        };
      }
    }).catch( err => {
      this.db.dis();
      return {
        status: 500,
        message: `Error al consultar paises, ${err.message}`
      }
    });
  }

  getPlaceIdByAbbr(abbr){
    this.db = new MongooseControl("Reader", "BGqs3qOdDJARWwJr", this.databaseName);
    this.db.con();
    return Place.findOne({ abbr: abbr }).then( place => {
      this.db.dis();
      return place._id;
    });
  }

  getPlaceNameById(id){
    this.db = new MongooseControl("Reader", "BGqs3qOdDJARWwJr", this.databaseName);
    this.db.con();
    return Place.findById(id).then( place => {
      this.db.dis();
      return place.name;
    });
  }

  destroy(){
    this.user = null;
    this.db = null;
  }

}

module.exports = DataBaseMethods;
