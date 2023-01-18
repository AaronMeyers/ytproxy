var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require( 'fs' );
require('dotenv').config();
const downloadPlaylists = require( './downloadPlaylist');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var ytRouter = require( './routes/yt' );

const app = express();
const server = require('http').createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist/')));
app.use(express.static(path.join(__dirname, 'node_modules/jquery/dist/')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/yt', ytRouter );
app.use('/gtts', require( './routes/gtts' ) );
app.use('/text-to-speech', require( './routes/azure_tts' ) );
// app.use('/headtrack', require( './routes/headtrack' ) );
require('./routes/headtrack')(app,server);



// const ws = require('ws');
// const wss = new ws.Server({ server });

// wss.on('connection', (ws) => {
//   console.log( 'connection!' );
//   ws.on( 'close', (e) => {
//     console.log( 'connection closed' );
//   });
// });
// app.get( '/headtrack/test', (req, res ) => {
//   res.render( 'headtrack', {title: 'test headtrack'} );
// });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// check if the settings file is present
if ( fs.existsSync( 'settings.json' ) )
{
  var settingsJson = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
  var playlistIds = [];
  var playlistInfos = settingsJson["musicPlaylists"];
  if ( playlistInfos )
  {
    playlistInfos.forEach(pi => {
      playlistIds.push( pi['id'] );
    });
    downloadPlaylists( playlistIds );
  }
}




module.exports = {
  app: app,
  server: server
}
