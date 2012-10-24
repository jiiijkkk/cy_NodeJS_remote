
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , client = require('./routes/client')
  , http = require('http')
  , https = require('https')
  , fs = require('fs')
  , path = require('path');

var options = {
    key:    fs.readFileSync('privatekey.pem').toString(),
    cert:   fs.readFileSync('certificate.pem').toString()
};
  
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('key', fs.readFileSync('privatekey.pem').toString());
  app.set('cert', fs.readFileSync('certificate.pem').toString());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get(/^\/explorer(\/.*)?$/, client.explorer);
app.get(/^\/view(\/.*)?$/, client.view);
app.get(/^\/download(\/.*)?$/, client.download);
app.post(/^\/upload(\/.*)?$/, client.upload);
app.get(/^\/remove(\/.*)?$/, client.remove);
app.get('/users', user.list);

https.createServer(options, app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

http.createServer(app).listen(app.get('port') + 1, function(){
  console.log("Express server listening on port " + (app.get('port') + 1));
});