var express = require('express');
var router = express.Router();

const Gtts = require('gtts');

router.get('/hear', function( req, res, next ) {

	var message = req.query.message ?? 'there was no message';

	console.log( 'message: ' + message );
	const gtts = new Gtts(message, "en");
	res.header( "Content-Disposition", 'attachment; filename="' + 'tts' + '.mp3"');
	gtts.stream().pipe(res);
});

router.get( '/', function( req, res, next ) {
	// var ids = getSavedIds();
	res.render( 'gtts', {title: 'test gtts'} );
});
module.exports = router;