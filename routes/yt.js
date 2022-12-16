var express = require('express');
var router = express.Router();
const ytdl = require('ytdl-core');
const fs = require( 'fs' );

router.get('/', function(req, res, next) {
	
	if ( req.query.id == null || !ytdl.validateID( req.query.id ) )
	{
		res.send( 'there was no valid id' );
		return;
	}


	var ytUrl = 'https://youtube.com/watch?v=' + req.query.id;
	var quality = req.query.quality ?? '18';
	res.header( "Content-Disposition", 'attachment; filename="Video.mp4"');
	ytdl( ytUrl, {quality: quality }).pipe( res );
});

router.get( '/list', function( req, res, next ) {
	var ids = getSavedIds();
	var toBeWritten = '';

	ids.forEach( (id) => {
		var line = id + '\t' +
			'<a href="./?id=' + id + '&quality=18">360p</a>\t' +
			'<a href="./?id=' + id + '&quality=136">720p</a>\t' +
			'<a href="./?id=' + id + '&quality=140">audio</a>\t' +
			'<br/>';
		toBeWritten += line;  
	});

	res.send( toBeWritten );
});

router.get( '/audioformats', async function( req, res, next ) {

	if ( req.query.id == null || !ytdl.validateID( req.query.id ) )
	{
		res.send( 'there was no valid id' );
		return;
	}

	addId( req.query.id );
	// res.send( 'hm' );
	
	let info = await ytdl.getInfo( 'https://youtube.com/watch?v=' + req.query.id );
	let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

	let toBeWritten = 'format itags:<br/>';
	audioFormats.forEach( (fmt) => {
		toBeWritten += fmt.itag + '–' + fmt.audioBitrate + '–' + fmt.container + '<br/>';
	})
	res.send( toBeWritten );

	// res.send('Formats with only audio: ' + audioFormats.length);
});

router.get( '/test', function( req, res, next ) {
	var quality = req.query.quality ?? '18';

	res.send( 'quality was: ' + quality );
});

router.get( '/info', function( req, res, next ) {
	var ytUrl = 'https://youtube.com/watch?v=' + req.query.id;
	var info = ytdl.getBasicInfo( ytUrl );
	info.then( function(val) {
		var json = JSON.stringify( val, null, 4 );
		res.send( 'success\n' + json );
	}, function() {
		res.send( 'failure' );
	})
	// res.send( 'info here ' + info );
});

function getSavedIds()
{
	var lines = fs.readFileSync('ids.txt').toString().split("\n");
	return lines;
}

function addId( id )
{
	var existingIds = getSavedIds();
	var idx = existingIds.indexOf( id );
	if ( idx < 0 )
	{
		existingIds.push( id );
		let toBeWritten = '';
		existingIds.forEach( ( anId, anIndex ) => { toBeWritten += anId + (anIndex<existingIds.length-1 ? '\n' : '' ) } )
		fs.writeFile( 'ids.txt', toBeWritten, () => {
			console.log( 'written' );
		});
	}
}

module.exports = router;
