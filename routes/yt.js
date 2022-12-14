var express = require('express');
var router = express.Router();
const ytdl = require('ytdl-core');

router.get('/', function(req, res, next) {
	var ytUrl = 'https://youtube.com/watch?v=' + req.query.id;
	res.header( "Content-Disposition", 'attachment; filename="Video.mp4"');
	ytdl( ytUrl, {format: 'mp4'}).pipe( res );
	// res.send( 'ok stuff happening here ' + ytUrl );
});

module.exports = router;
