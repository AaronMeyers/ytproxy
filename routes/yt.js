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
	var quality = req.query.quality ?? ['22', '18'];
	res.header( "Content-Disposition", 'attachment; filename="' + req.query.id + '.mp4"');
	ytdl( ytUrl, {quality: quality }).pipe( res );
});

router.get( '/list', function( req, res, next ) {
	var ids = getSavedIds();
	res.render( 'yt_list', {title: 'test ids', ids: ids} );
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
	// let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
	// let audioFormats = ytdl.filterFormats(info.formats, format => format.container === 'webm' );
	let audioFormats = ytdl.filterFormats(info.formats, format => format.audioBitrate && format.bitrate );

	let toBeWritten = 'format itags:<br/>';
	audioFormats.forEach( (fmt) => {
		toBeWritten += fmt.itag + '–' + fmt.audioBitrate + '–' + fmt.container + ' --- ' + fmt.height + '<br/>';
	})
	res.send( toBeWritten );

	// res.send('Formats with only audio: ' + audioFormats.length);
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
