var restclient = require('node-rest-client').Client;
var client = new restclient();
var Twit = require('twit');
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var app = require('express')();
var path = require('path');

// Twitter app info
var T = new Twit(require('./config.js'));

// Data stuff 
var doc = new GoogleSpreadsheet('1yQ_Ff6iqK3ANekxOLr6RgOC9EDbiA8BMXsu6YVxVd7w');
var corporaBaseURL = 'https://botwiki.org/api/corpora/data/';
var corporaData = ['games/pokemon.json', 'film-tv/tv_shows.json', 'science/planets.json', 'words/nouns.json', 'objects/objects.json', 'humans/celebrities.json'];


app.get('/', function(req, res){
  res.sendFile(path.resolve('index.html'));
});

app.listen(3000);


var statement = 'My president is';

function makeSentence() {
  var num = Math.floor(Math.random() * corporaData.length+1);
  if (num > corporaData.length) {
    doc.getInfo(function(err, info) {
      sheet = info.worksheets[0];
      sheet.getRows({
        offset: 1,
        limit: 20,
        orderby: 'col2'
      }, function( err, rows ){
        console.log('Read '+rows.length+' rows');
      });
    });
  }
  else {
    var url = corporaBaseURL + corporaData[num];
    client.get(url, function (data, response) {
      console.log(data);
    });
  }
}

function favRTs () {  
  T.get('statuses/retweets_of_me', {}, function (e,r) {
    for(var i=0;i<r.length;i++) {
      T.post('favorites/create/'+r[i].id_str,{},function(){});
    }
    console.log('harvested some RTs'); 
  });
}

/*  Every 2 minutes, make and tweet a sentence
 *  wrapped in a try/catch in case Twitter is unresponsive,
 *  don't really care about error handling. it just won't tweet. 
 */
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
