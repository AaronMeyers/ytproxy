var express = require('express');
var router = express.Router();

const { textToSpeech } = require('../azure-cognitiveservices-speech');


router.get( '/test', async( req, res, next ) => {
	res.render( 'azure_tts', {title: 'test azure tts' } );
});

// creates a temp file on server, the streams to client
/* eslint-disable no-unused-vars */
router.get('/', async (req, res, next) => {
    
	const key = process.env.AZURE_KEY;
	const region = "eastus";
	const file = null;
  
	const { message } = req.query;

	const styles = [
		"general",
		"shouting",
		"whispering",
		"cheerful",
		"sad",
		"friendly"
	]

	var chosenStyle = styles[~~(Math.random()*styles.length)];
	console.log( chosenStyle );
	
	if (!key || !region || !message) res.status(404).send('Invalid query string');
	
	let fileName = null;
	
	// stream from file or memory
	if (file && file === true) {
		fileName = `./temp/stream-from-file-${timeStamp()}.mp3`;
	}

  var ssmlPhrase = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
  xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
<voice name="en-US-DavisNeural">
   <mstts:express-as style="`+chosenStyle+`">` + message +
   `</mstts:express-as>
</voice>
</speak>`
	
	const audioStream = await textToSpeech(key, region, ssmlPhrase, fileName);
	// res.set({
	// 	'Content-Type': 'audio/mpeg',
	// 	'Transfer-Encoding': 'chunked'
	// });
	res.header( "Content-Disposition", 'attachment; filename="' + 'tts' + '.mp3"');
	audioStream.pipe(res);
  });

module.exports = router;