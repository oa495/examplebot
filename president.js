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
var corpora = ['games/pokemon.json', 'film-tv/tv_shows.json', 'science/planets.json', 'words/nouns.json', 'objects/objects.json', 'humans/celebrities.json'];


app.get('/', function(req, res){
  res.sendFile(path.resolve('index.html'));
});

app.listen(3000);


var base = 'My president is ';

function makeSentence() {
  var num = Math.floor(Math.random() * corpora.length+1);
  var statement = base;
  if (num >= corpora.length) {
    doc.getInfo(function(err, info) {
      sheet = info.worksheets[0];
      sheet.getCells({
      }, function( err, cells ){
          var rand = Math.floor(Math.random() * cells.length);
          console.log(cells[rand].value)
          statement += cells[rand].value;
          console.log(statement);
          postToTwitter(statement);
          statement = '';
      });
    });
  }
  else {
    var url = corporaBaseURL + corpora[num];
    client.get(url, function (data, response) {
      for (key in data) {
        if (key !== 'description') {
            var corporaData = data[key];
            var rand = Math.floor(Math.random() * corporaData.length);
            console.log(corporaData);
            var val = corporaData[rand];
            if (!(typeof val === 'string') && val) {
              val = val.name;
            }
            console.log(val);
            statement += val;
            console.log('here is the statement', statement);
            postToTwitter(statement);
            statement = '';
        }
      }
    });
  }
}

function postToTwitter(statement) {
  T.post('statuses/update', { status: statement }, function(err, reply) {
    console.log(err);
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

/*  Every 45 minutes, make and tweet a sentence
 *  wrapped in a try/catch in case Twitter is unresponsive,
 *  don't really care about error handling. it just won't tweet. 
 */
setInterval(function() {
  try {
    makeSentence();
  }
 catch (e) {
    console.log(e);
  }
},5000);


// every 5 hours, check for people who have RTed a metaphor, and favorite that metaphor
setInterval(function() {
  try {
    favRTs();
  }
 catch (e) {
    console.log(e);
  }
},60000*60*5);
