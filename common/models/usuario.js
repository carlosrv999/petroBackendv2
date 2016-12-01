'use strict';

module.exports = function(Usuario) {
	Usuario.on('resetPasswordRequest', function (info) {
		var url = 'http://54.162.242.52'+':3000'+'/cambiarPass';
		console.log(url);
		var html = 'Click <a href="'+url+'?access_token='+info.accessToken.id+'">Aqui</a> para resetear tu password' ;
		console.log(info.email); // the email of the requested user
		console.log(info.accessToken.id); // the temp access token to allow password reset
		Usuario.app.models.Correo.send({
			to : info.email,
		    from : info.email,
		    subject : 'Resetear Password',
		    html : html
		}, function(err){
			if(err) return console.log("error en enviar email para cambiar contrasena");
			console.log("email enviado");
		});
	});
};