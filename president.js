var restclient = require('node-rest-client');
var Twit = require('twit');
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

// Twitter app info
var T = new Twit(require('./config.js'));
var app = require('express')();
var path = require('path');

var doc = new GoogleSpreadsheet('1yQ_Ff6iqK3ANekxOLr6RgOC9EDbiA8BMXsu6YVxVd7w');

// I deployed to Nodejitsu, which requires an application to respond to HTTP requests
// If you're running locally you don't need this, or express at all.
app.get('/', function(req, res){
  //res.sendfile('index.html');
  res.sendFile(path.resolve('index.html'));
});

app.listen(3000);

var corporaBaseURL = 'https://botwiki.org/api/corpora/data/';
var corporaData = ['games/pokemon.json', 'film-tv/tv_shows.json', 'science/planets.json', 'words/nouns.json', 'objects/objects.json', 'humans/celebrities.json'];

var statement =   "";

function makeSentence() {
  console.log('in here');
  statement = "My president is";

 doc.getInfo(function(err, info) {
    console.log(info);
    // sheet = info.worksheets[0];
    // console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
    // step();
  });
}

function favRTs () {  
  T.get('statuses/retweets_of_me', {}, function (e,r) {
    for(var i=0;i<r.length;i++) {
      T.post('favorites/create/'+r[i].id_str,{},function(){});
    }
    console.log('harvested some RTs'); 
  });
}

// every 2 minutes, make and tweet a metaphor
// wrapped in a try/catch in case Twitter is unresponsive, don't really care about error
// handling. it just won't tweet.
setInterval(function() {
  try {
    // makeSentence();
  }
 catch (e) {
    console.log(e);
  }
},5000);

makeSentence();

// // every 5 hours, check for people who have RTed a metaphor, and favorite that metaphor
// setInterval(function() {
//   try {
//     //favRTs();
//   }
//  catch (e) {
//     console.log(e);
//   }
// },60000*60*5);
