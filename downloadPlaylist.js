var express = require('express');
var http = require( 'http' );
var https = require( 'https' );
const ytdl = require('ytdl-core');
var fs = require('fs')

const apiKey = process.env.GOOGLE_KEY ?? '';
const downloadPath = 'downloaded/'

async function downloadPlaylists( playlistIds )
{
	for ( var i=0; i<playlistIds.length; i++ )
	{
		await doIt( playlistIds[i] );
	}
	console.log( 'done downloading playlists' );
}


async function doIt( id )
{
	await new Promise((resolve,reject) => {
		if ( id == null )
		{
			console.log( 'there was no id' );
			resolve();
			return;
		}

		var url = "https://www.googleapis.com/youtube/v3/playlistItems?key=" + apiKey + "&maxResults=50&part=snippet,status&playlistId=" + id;

		https.get(url, function(res){
			var body = '';
			res.on('data', function(chunk){
				body += chunk;
			});
			res.on('end', async function(){
				var jsonResponse = JSON.parse(body);
				var items = jsonResponse.items;
				// console.log( 'playlist contained ' + items.length + 'items' );


				for( var i=0; i<items.length; i++ )
				{
					var item= items[i];
					var status = item["status"]["privacyStatus"];
					var title = item["snippet"]["title"];
					var ytId = item["snippet"]["resourceId"]["videoId"];

					if ( status != 'public' )
						continue;

					var filePath =  downloadPath + ytId + '.mp4';
					if ( fs.existsSync( filePath ) )
					{
						continue;
					}

					console.log( 'downloading ' + title );
					var startTime = Date.now();
					await downloadYoutube( ytId );
					var elapsedSeconds = (Date.now() - startTime) / 1000;
					console.log( 'downloaded in ' + elapsedSeconds + ' seconds' );
				}

				// console.log( title + " status: " + status + " id: " + ytId );

				// console.log("Got a response: ", jsonResponse);
				resolve();
			});
		}).on('error', function(e){
			console.log("Got an error: ", e);
			reject();
	  });
	});


}
async function downloadYoutube( id, cb )
{
	if ( !fs.existsSync( downloadPath ) )
	{
		console.log( 'created folder at ' + downloadPath );
		fs.mkdirSync( downloadPath );
	}

	var ytUrl = 'https://youtube.com/watch?v=' + id;
	var filePath = downloadPath + id + '.mp4';
	var fstream = fs.createWriteStream( filePath );

	let success = false;

	try {
		await new Promise((resolve,reject)=>{

			var vid = ytdl( ytUrl, {'quality':[ '22', '18' ]} )
			vid
			.on( 'end', () => {
				success = true;
				resolve();
			 } )
			.on( 'error', (error) => {
				vid.destroy(error);
				reject(error);
			})
			.pipe( fstream )
		});
	}
	catch (error )
	{
		fstream.close(() => {
			fs.unlink( filePath, () => {
				console.log( 'file deleted at ' + filePath );
			} );
		})
	}

	return success;
}

module.exports = {
	downloadPlaylists,
	downloadYoutube
};