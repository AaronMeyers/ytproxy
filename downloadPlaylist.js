var express = require('express');
var http = require( 'http' );
var https = require( 'https' );
const ytdl = require('ytdl-core');
var fs = require('fs')

const apiKey = process.env.GOOGLE_KEY ?? '';
const downloadPath = 'downloaded/'

async function downloadYoutube( id, cb )
{
	if ( !fs.existsSync( downloadPath ) )
	{
		console.log( 'created folder at ' + downloadPath );
		fs.mkdirSync( downloadPath );
	}

	var ytUrl = 'https://youtube.com/watch?v=' + id;
	var fstream = fs.createWriteStream( downloadPath + id + '.mp4' );
	// var startTime = Date.now();
	// fstream.on( 'close', function() {
	// 	var elapsedSeconds = (Date.now() - startTime) / 1000;
	// 	console.log( 'downloaded ' + id + ' in ' + elapsedSeconds + ' seconds' );
	// });

	await new Promise((resolve,reject)=>{
		ytdl( ytUrl, {'quality':'140'} ).pipe( fstream )
		.on( 'close', resolve )
		.on( 'error', reject );
	});
}

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
	
					if ( fs.existsSync( downloadPath + ytId + '.mp4') || status != 'public' )
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
module.exports = downloadPlaylists;