var cookieParser = require('cookie-parser');
module.exports = function(app){

	var router = app.loopback.Router();
	var Usuario = app.models.Usuario;
	var Estacion = app.models.Estacion;
	var Producto = app.models.Producto;
	var AccessToken = app.models.AccessToken;
	var Correo = app.models.Correo;

	router.get('/', function(req,res){
		console.log('cookies : ',req.cookies);
		return res.render('homepage');
	})

	router.get('/crearUsuario', function(req,res){
		return res.render('crearuser');
	})

	router.post('/crearUsuario', function(req,res){
		var correo = req.body.email;
		var password = req.body.password;
		//console.log(correo);
		//console.log(password);
		Usuario.create({
			email : correo,
			password : password
		}, function(err,userInstance){
			if(err){
				return res.render('crearuser',{
                    modo: "noob",
                    mostrarTitulo: "Error en registro",
                    mostrarMensaje: "El email ya esta registrado",
                });
			}
			return res.render('login', {
				modo: "gggggg",
                mostrarTitulo: "Registro exitoso",
                mostrarMensaje: "Ya puede inicial sesion"
			})
		})
	})

	router.get('/login', function(req,res){
		if(req.cookies.accessToken) return res.redirect('/estaciones');
		return res.render('login');
	})

	router.get('/recuperarPass', function(req,res){
		return res.render('recuperarcontrasena');
	})

	router.post('/recuperarPass', function(req,res){
		var email = req.body.form_email;
		console.log('email: ', email);
		
		Usuario.findOne({
			where:{
				email: email
			}
		}, function(err, ObjUsuario) {
			if(err) return res.sendStatus(404);
			else if(ObjUsuario == null) {
				return res.render('recuperarcontrasena', {
					mostrarMensaje : "La direccion de correo no existe", 
					mostrarTitulo : "Error Usuario"
				});
			} else {
				Usuario.resetPassword({
					email : email
				}, function(err) {
					if(err) return res.sendStatus(404);
					return res.render('login', {
						mostrarTitulo : "Cambio de password", 
						mostrarMensaje : "Revise su email"
					});
				});
			}
		});
	})

	router.get('/cambiarPass', function(req,res){
		AccessToken.findById(req.query.access_token, function(err, instance) {
			if(err) {
				console.log(err);
				return res.sendStatus(404);
			} else if(instance == null) {
				return res.json({ message : "el link ha expirado" });
			} else {
				Usuario.findById(instance.userId, function(err, instanceUser) {
					if(err) return res.sendStatus(404);
					else if(instanceUser == null){
						return res.json({ message : 'El usuario no existe' });
					} else {
						console.log(instanceUser.email);
						return res.render('cambiarcontrasena', {
							mostrarTitulo : 'Crear una nueva clave para:',
							mostrarMensaje : instanceUser.email,
							messageTok : req.query.access_token
						});
					}
				})
			}
		})
	});

	router.post('/cambiarPass', function(req,res){
		AccessToken.findById(req.body.access_tok, function(err, instance) {
			if(err) {
				console.log(err);
				return res.sendStatus(404);
			} else if(instance == null) {
				return res.json({ message : "el link ha expirado" });
			} else {
				Usuario.findById(instance.userId, function(err, instanceUser) {
					if(err) return res.sendStatus(404);
					else if(instanceUser == null){
						return res.json({ message : "El usuario no existe" });
					} else {
						console.log("antes:");
						console.log(instanceUser);
						instanceUser.password = req.body.password;
						instanceUser.save();
						console.log("despues:");
						console.log(instanceUser);
						return res.render('login', {
							mostrarTitulo : 'Contrasena modificada',
							mostrarMensaje : 'Ya puede iniciar sesion',
						});
					}
				})
			}
		})
	})

	router.post('/login', function(req,res){
		var correo = req.body.form_email;
		var password = req.body.form_password;
		Usuario.login({
			email : correo,
			password : password
		}, 'user', function(err, token){
			if(err){
				console.log("error en ingreso", err);
				return res.render('login', {
					modo: "gggggg",
                    mostrarTitulo: "Error en ingreso",
                    mostrarMensaje: "El usuario y/o password no son correctos"
				})
			}
			res.cookie('accessToken', token);
			return res.redirect('/estaciones');
		});
	})

	router.get('/logout', function(req,res,next){
		//console.log(req.accessToken.id);
		if(!req.cookies.accessToken) return res.sendStatus(401);
		Usuario.logout(req.cookies.accessToken.id, function(err){
			if(err) return next(err);
			console.log(req.cookies.accessToken);
			res.clearCookie('accessToken');
			console.log('salida exitosa');
			res.redirect('/');
		})
	})

	router.get('/estaciones', function(req,res){

		if(!req.cookies.accessToken) {
			console.log('sin token');
			return res.redirect('/');
		}
		if(req.cookies.accessToken.userId == '582f64f336957b6a0afb0e4d'){
			Estacion.find({
				include: ['usuario']
			}, function(err, objResult_estacion) {
				if(err) return res.sendStatus(404);
				objResult_estacion = objResult_estacion.map(function(obj) {
	                return obj.toJSON();
	            })
				res.render('estaciones', {
					objResult_estacion : objResult_estacion
				})
			})
		} else {
			Estacion.find({
				where : {
					userId : req.cookies.accessToken.userId
				}, include: ['usuario']
			}, function(err, objResult_estacion) {
				if(err) return res.sendStatus(404);
				objResult_estacion = objResult_estacion.map(function(obj) {
	                return obj.toJSON();
	            })
				res.render('estaciones', {
					objResult_estacion : objResult_estacion
				})
			})
		}
	})
	
	router.get('/productos', function(req,res){
		if(!req.cookies.accessToken && !req.cookies.idEstacion) {
			console.log('sin token');
			return res.redirect('/');
		}
		Producto.find({
			where : {
				idEstacion : req.cookies.idEstacion
			}, include: ['estacion']
		}, function(err, objResult_producto) {
			if(err) return res.sendStatus(404);
			objResult_producto = objResult_producto.map(function(obj) {
                return obj.toJSON();
            })
			res.render('productos', {
				objResult_producto : objResult_producto
			})
		})
		
	})
	
	router.get('/obtenerTodaEstacion', function(req,res){
		Estacion.find({}, function(err, instances){
			if(err) return console.log("error: ", err);
			return res.json(instances);
		})
	})
	
	router.get('/productosjson', function(req,res){
		var idEstacion = req.query.idEstacion;
		Producto.find({
			where : {
				idEstacion : idEstacion
			}, include: ['estacion']
		}, function(err, objResult_producto) {
			if(err) return res.sendStatus(404);
			return res.json(objResult_producto);
		})
		
	})
	
	router.post('/productos', function(req,res){
		
		if(!req.cookies.accessToken) {
			console.log('sin token');
			return res.redirect('/');
		}
		console.log("hola ",req.body.idEstacion);
		res.cookie('idEstacion', req.body.idEstacion);

		Producto.find({
			where : {
				idEstacion : req.body.idEstacion
			}, include: ['estacion']
		}, function(err, objResult_producto) {
			if(err) return res.sendStatus(404);
			objResult_producto = objResult_producto.map(function(obj) {
                return obj.toJSON();
            })
			res.render('productos', {
				objResult_producto : objResult_producto
			})
		})
	})
	/*router.get('/estaciones', function(req,res){
		console.log(req.accessToken);
		console.log(req.accessToken.userId);
		if(!req.accessToken) {
			console.log('sin token');
			return res.redirect('/');
		}
		Estacion.find({
			where : {
				userId : req.accessToken.userId
			}
		}, function(err, obj){
			if(err)return console.log('error:',err);

			else {
				console.log(obj);
				return res.json(obj);
			}
		});
	})*/

	router.get('/crearEstacion', function(req,res){
		
		if(!req.cookies.accessToken){
			console.log('sin token');
			return res.redirect('/');
		}
		
		res.render('crearestacion');
	})

	router.get('/crearProducto', function(req,res){
		
		if(!req.cookies.accessToken){
			console.log('sin token');
			return res.redirect('/');
		}
		
		res.render('crearproducto');
	})

	router.post('/crearEstacion', function(req,res){
		
		if(!req.cookies.accessToken){
			console.log('sin token');
			return res.redirect('/');
		}
		
		var idUsuario = req.cookies.accessToken.userId;
		var nombre = req.body.nombre;
		var latitud = req.body.latitud;
		var longitud = req.body.longitud;
		Estacion.create({
			nombre : nombre,
			geoPoint : {
				lat: latitud,
				lng: longitud
			},
			userId : idUsuario
		}, function(err, obj){
			if(err) {
				console.log('error en : ', err);
				return res.render('crearestacion', {
					message : 'error en crear'
				})
			}
            if(req.body.dieselpro){
            	Producto.create({
					nombre : 'Diesel Pro',
					precio : 13.24,
					idEstacion : obj.id
				}, function(err, obj){
					if(err) {
						console.log('error en : ', err);
						return res.sendStatus(404);
					}
				});
            }
			if(req.body.dieselproeco){
				Producto.create({
					nombre : 'Diesel Pro Eco',
					precio : 12.11,
					idEstacion : obj.id
				}, function(err, obj){
					if(err) {
						console.log('error en : ', err);
						return res.sendStatus(404);
					}
				});
			}
			if(req.body.gas90){
				Producto.create({
					nombre : 'Gasolina 90',
					precio : 11.25,
					idEstacion : obj.id
				}, function(err, obj){
					if(err) {
						console.log('error en : ', err);
						return res.sendStatus(404);
					}
				});
			}
			if(req.body.gas95){
				Producto.create({
					nombre : 'Gasolina 95',
					precio : 11.98,
					idEstacion : obj.id
				}, function(err, obj){
					if(err) {
						console.log('error en : ', err);
						return res.sendStatus(404);
					}
				});
			}
			if(req.body.gas98){
				Producto.create({
					nombre : 'Gasolina 98',
					precio : 12.80,
					idEstacion : obj.id
				}, function(err, obj){
					if(err) {
						console.log('error en : ', err);
						return res.sendStatus(404);
					}
				});
			}
			if(req.body.glp){
				Producto.create({
					nombre : 'GLP',
					precio : 1.24,
					idEstacion : obj.id
				}, function(err, obj){
					if(err) {
						console.log('error en : ', err);
						return res.sendStatus(404);
					}
				});
			}
			if(req.body.gnv){
				Producto.create({
					nombre : 'GNV',
					precio : 1.44,
					idEstacion : obj.id
				}, function(err, obj){
					if(err) {
						console.log('error en : ', err);
						return res.sendStatus(404);
					}
				});
			}
			if(req.body.repshop){
				Producto.create({
					nombre : 'RepShop',
					precio : 0,
					idEstacion : obj.id
				}, function(err, obj){
					if(err) {
						console.log('error en : ', err);
						return res.sendStatus(404);
					}
				});
			}
			Estacion.find({
				where : {
				userId : req.cookies.accessToken.userId
			}, include: ['usuario']
				}, function(err, objResult_estacion) {
					if(err) return res.sendStatus(404);
					objResult_estacion = objResult_estacion.map(function(obj) {
	            	    return obj.toJSON();
	            	});
				res.render('estaciones', {
					objResult_estacion : objResult_estacion, 
					message : 'Estacion creada exitosamente.'
				})
			})
		});
	})

	

	router.post('/crearProducto', function(req,res){
		
		if(!req.cookies.accessToken){
			console.log('sin token');
			return res.redirect('/');
		}
		var idEstacion = req.cookies.idEstacion;
		var nombre = req.body.nombre;
		var precio = req.body.precio;
		Producto.create({
			nombre : nombre,
			precio : precio,
			idEstacion : idEstacion
		}, function(err, obj){
			if(err) {
				console.log('error en : ', err);
				return res.render('crearproducto', {
					message : 'error en crear'
				})
			}
			console.log(obj);
			Producto.find({
				where : {
					idEstacion : idEstacion
				}, include: ['estacion']
			}, function(err, objResult_producto) {
				if(err) return res.sendStatus(404);
				objResult_producto = objResult_producto.map(function(obj) {
                return obj.toJSON();
            })
			res.render('productos', {
				objResult_producto : objResult_producto
			})
		})
		});
	})

	


	router.post('/eliminarEstacion', function(req,res){
		if(!req.cookies.accessToken){
			console.log('sin token');
			return res.redirect('/');
		}
		var idEstacion = req.body.idEstacion;
		console.log(idEstacion);
		Estacion.destroyById(idEstacion, function(err){
			if(err) return res.sendStatus(404);
			
			Producto.destroyAll({ idEstacion : idEstacion }, function(err2,info){
				if(err){
					console.log("error en eliminar productos de estacion borrada: ",err2);
					return res.sendStatus(404);
				}
				console.log("eliminacion de productos exitosa: ",info);
			})
			
			Estacion.find({
				where : {
				userId : req.cookies.accessToken.userId
			}, include: ['usuario']
			}, function(err, objResult_estacion) {
				if(err) return res.sendStatus(404);
				objResult_estacion = objResult_estacion.map(function(obj) {
            	    return obj.toJSON();
            	})
            //console.log(objResult_estacion);
			res.render('estaciones', {
				objResult_estacion : objResult_estacion, 
				message : 'Estacion eliminada exitosamente.'
			})
		})

		});
	})
	router.post('/eliminarProducto', function(req,res){
		if(!req.cookies.accessToken){
			console.log('sin token');
			return res.redirect('/');
		}
		var idEst = req.cookies.idEstacion;
		var idProducto = req.body.idProducto;
		console.log(idProducto);
		Producto.destroyById(idProducto, function(err){
			if(err) return res.sendStatus(404);
			Producto.find({
				where : {
					idEstacion : idEst
				}, include: ['estacion']
			}, function(err, objResult_producto) {
				if(err) return res.sendStatus(404);
				objResult_producto = objResult_producto.map(function(obj) {
            	    return obj.toJSON();
            	})
				res.render('productos', {
					objResult_producto : objResult_producto
				})
			})

		});
	})

	router.post('/editarEstacion', function(req,res){
		if(!req.cookies.accessToken){
			console.log('sin token');
			return res.redirect('/');
		}
		res.cookie('idEstacionEditar', req.body.idEstacion);
		var nombre;
		var lat;
		var lng;
		Estacion.findById(req.body.idEstacion, function(err, instance){
			if(err) return res.sendStatus(404);
			console.log(instance);
			nombre = instance.nombre;
			lat = instance.geoPoint.lat;
			lng = instance.geoPoint.lng;
			return res.render('editarestacion',{
				messageNombre : nombre,
				messageLat : lat,
				messageLng : lng
			});
		})
		
	})

	router.post('/editarProducto', function(req,res){
		if(!req.cookies.accessToken){
			console.log('sin token');
			return res.redirect('/');
		}
		res.cookie('idProductoEditar', req.body.idProducto);
		var nombre;
		var precio;
		Producto.findById(req.body.idProducto, function(err, instance){
			if(err) return res.sendStatus(404);
			console.log(instance);
			nombre = instance.nombre;
			precio = instance.precio;
			return res.render('editarproducto',{
				messageNombre : nombre,
				messagePrecio : precio
			});
		})
	})

	router.post('/editarEstacion/confirm', function(req,res){
		if(!req.cookies.accessToken){
			console.log('sin token');
			return res.redirect('/');
		}
		var idEstacionEdit = req.cookies.idEstacionEditar;
		Estacion.updateAll({
			id : idEstacionEdit
		}, {
			nombre : req.body.nombre,
			geoPoint : {
				lat : Number(req.body.latitud),
				lng : Number(req.body.longitud)
			}
		}, function(err, info){
			if(err) return res.sendStatus(404);
			console.log("exito ", info);
			Estacion.find({
				where : {
				userId : req.cookies.accessToken.userId
			}, include: ['usuario']
			}, function(err, objResult_estacion) {
				if(err) return res.sendStatus(404);
				objResult_estacion = objResult_estacion.map(function(obj) {
            	    return obj.toJSON();
            	})
            //console.log(objResult_estacion);
			res.render('estaciones', {
				objResult_estacion : objResult_estacion, 
				message : 'Estacion editada exitosamente.'
			})
		})
		});
	})

	router.post('/editarProducto/confirm', function(req,res){
		if(!req.cookies.accessToken){
			console.log('sin token');
			return res.redirect('/');
		}
		var idProductoEdit = req.cookies.idProductoEditar;
		Producto.updateAll({
			id : idProductoEdit
		}, {
			nombre : req.body.nombre,
			precio : req.body.precio
		}, function(err, info){
			if(err) return res.sendStatus(404);
			console.log("exito", info);
			Producto.find({
				where : {
					idEstacion : req.cookies.idEstacion
				}, include: ['estacion']
			}, function(err, objResult_producto) {
				if(err) return res.sendStatus(404);
				objResult_producto = objResult_producto.map(function(obj) {
            	    return obj.toJSON();
            	})
            	
				res.render('productos', {
					objResult_producto : objResult_producto,
					message : 'Producto editado exitosamente'
				})
			})
		});
	})

	


	//router.get('/productos', function(req,res){
	//	console.log(req.accessToken);
	//})
	app.use(router);

}