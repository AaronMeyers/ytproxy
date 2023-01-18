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

	let senders = [];
	let receivers = [];

	app.get( '/headtrack/test', (req, res ) => {
		res.render( 'headtrack', {title: 'test headtrack'} );
	});

	wss.on('connection', (ws) => {
		
		wss.clients.forEach((client) => {
			client.send(JSON.stringify({message: 'someone connected!'}));
		});
		console.log( 'connection!' );
		console.log( 'num clients: ' + wss.clients.size );
		ws.on( 'message', (message) => {
			var json = JSON.parse( message );
			var theMessage = json.message;

			switch ( theMessage )
			{
				case 'rotation':
					// console.log( 'x: ' + json.x + ', y: ' + json.y + ', z: ' + json.z );
					wss.clients.forEach( (receiver) => {
						// console.log( 'sending out a rotation' );
						receiver.send( message );
					});
					break;

				case 'sender':
					if ( senders.indexOf( ws ) < 0 )
					{
						console.log( 'adding a headtracking sender' );
						senders.push( ws );
						console.log( 'headtracking sender count: ' + senders.length );
					}
					break;

				case 'receiver':
					if ( receivers.indexOf( ws ) < 0 )
					{
						console.log( 'adding a headtracking receiver' );
						receivers.push( ws );
						console.log( 'headtracking receiver count: ' + receivers.length );
						ws.send( JSON.stringify({message:'cool!'}));
					}
					break;

				default:
					console.log( 'some other message came through: ' + theMessage );
					break;
			}
			
		});
		ws.on( 'close', (e) => {
			console.log( 'connection closed' );
			console.log( 'num clients: ' + wss.clients.size );

			let senderIndex = senders.indexOf( ws );
			let receiverIndex = receivers.indexOf( ws );

			if ( senderIndex >= 0 )
				senders.splice( senderIndex, 1 );

			if ( receiverIndex >= 0 )
				receivers.splice( receiverIndex, 1 );
		});
	});

	// router.get('/myroute', app.sessionMW, function (req, res, next) {

	// });
}