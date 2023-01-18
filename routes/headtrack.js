// var express = require('express');
// var router = express.Router();
// const ws = require('ws');
// const server = require('http').createServer(app);
// const wss = new ws.Server({ server });

// // wss.on('connection', (ws) => {
// // 	console.log( 'connection!' );
// // 	ws.on( 'close', (e) => {
// // 		console.log( 'connection closed' );
// // 	});
// // });

// router.get( '/test', function( req, res, next ) {
// 	res.render( 'headtrack', {title: 'test headtrack' } );
// });

// module.exports = router;

module.exports = function(app, server) {     

	const ws = require('ws');
	// const server = require('http').createServer(app);
	const wss = new ws.Server({ server });
	// console.log( wss );

	app.get( '/headtrack/test', (req, res ) => {
		res.render( 'headtrack', {title: 'test headtrack'} );
	});

	wss.on('connection', (ws) => {
		console.log( 'connection!' );
		console.log( 'num clients: ' + wss.clients.size );
		ws.on( 'message', (message) => {
			var json = JSON.parse( message );
			var theMessage = json.message;

			console.log( 'message: ' + theMessage );
		});
		ws.on( 'close', (e) => {
			console.log( 'connection closed' );
			console.log( 'num clients: ' + wss.clients.size );
		});
	});

	// router.get('/myroute', app.sessionMW, function (req, res, next) {

	// });
}