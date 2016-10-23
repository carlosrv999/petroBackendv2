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



	app.use(router);

}