module.exports = function(app){

	var router = app.loopback.Router();
	var Usuario = app.models.Usuario;
	var Estacion = app.models.Estacion;
	var Producto = app.models.Producto;
	console.log("mierda");
	


	router.get('/', function(req,res){
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
				console.log(err);
				return res.render('crearuser',{
                    modo: "noob",
                    mostrarTitulo: "Error en registro",
                    mostrarMensaje: "El email ya esta registrado",
                });
			}
			return res.json(userInstance);
		})
	})

	router.get('/login', function(req,res){
		return res.render('login');
	})

	router.post('/login', function(req,res){
		var correo = req.body.form_email;
		var password = req.body.form_password;
		//console.log(correo);
		//console.log(password);
		Usuario.login({
			email : correo,
			password : password
		}, 'user', function(err, token){
			if(err){
				console.log("error en ingreso", err);
				return res.render('login', {
					modo: "gggggg",
                    mostrarTitulo: "Error en ingreso",
                    mostrarMensaje: "El usuario y/o password no son correctos",
				})
			}
			console.log(token.id);
			console.log(token.userId);
			return res.render('principal', {
				email: req.body.form_email,
                accessToken: token.id
			});
		});
	})

	router.get('/logout', function(req,res,next){
		//console.log(req.accessToken.id);
		if(!req.accessToken) return res.sendStatus(401);
		Usuario.logout(req.accessToken.id, function(err){
			if(err) return next(err);
			console.log('salida exitosa');
			res.redirect('/');
		})
	})
/*
	router.get('/usuarioConEstacion', function(req,res){
		Usuario.findById('580c0bec1138d99f0c89d5d6',{
			include : 'estacions'
		}, function(err, obj){
			if(err)return console.log('error:',err);
			else return res.json(obj);
		});
	})*/

	/*router.get('/crear', function(req,res){
		Estacion.create({
			nombre : 'cacapedo',
			geoPoint : {
				lat : -44.141414,
				lng : -22.555555
			},
			userId : '580c0bec1138d99f0c89d5d6'
		} , function(err, obj){
			if(err)return console.log("error en : ",err);
			return res.json(obj);
		})
	})*/

	router.get('/estaciones', function(req,res){
		console.log(req.accessToken);
		console.log(req.accessToken.userId);
		if(!req.accessToken) {
			console.log('sin token');
			return res.redirect('/');
		}
		Estacion.find({
			where : {
				userId : req.accessToken.userId
			}, include: ['usuario']
		}, function(err, objResult_estacion) {
			if(err) return res.sendStatus(404);
			objResult_estacion = objResult_estacion.map(function(obj) {
                return obj.toJSON();
            })
			res.render('estaciones', {
				objResult_estacion : objResult_estacion,
				accessToken : req.accessToken.id
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
		console.log(req.accessToken);
		console.log(req.accessToken.userId);
		if(!req.accessToken){
			console.log('sin token');
			return res.redirect('/');
		}
		return res.render('crearestacion',{
			userId: req.accessToken.userId,
			accessToken: req.accessToken.id
		})
	})

	router.post('/crearEstacion', function(req,res){
		var idUsuario = req.body.userId;
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
			if(err) return console.log('error en : ', err);
			console.log(obj);
			return res.json(obj);
		});
	})

	//router.get('/productos', function(req,res){
	//	console.log(req.accessToken);
	//})
	app.use(router);

}