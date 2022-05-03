var http = require('http');
var fs = require('fs');
var url = require('url');
var getJSON = require('get-json')
var sha512 = require('js-sha512');
const ws = require('ws');
const wss = new ws.Server({
  port: 2999
}, '0.0.0.0');

function SEND(F, M) {
  if(F.readyState == F.OPEN) {
    F.send(JSON.stringify(M));
  }
}
let Users = new Set();
var LAST;
async function heartbeat() {
  var TIME = Math.round(Date.now() / 1000);
  const d = new Date();
    var Z = "https://codeforces.com/api/contest.standings?contestId=362075&apiKey={insert public API key here}&time=";
    Z += TIME;
    Z += "&apiSig=222222"; //API signature
    var Q = "111111/contest.standings?apiKey={insert public API key here}&contestId=362075&time=";
    Q += TIME;
    Q += "{insert secret API key here}"
    var X = sha512(Q); //SHA512 hash for API request. Read this for more details: https://codeforces.com/apiHelp
    getJSON(Z + X, function(error, response) {
      if(error === null) LAST = response.result;
    });
    Users.forEach((F) => {
      SEND(F, LAST);
    });
  await new Promise(resolve => setTimeout(resolve, 20000));
  heartbeat();
}
heartbeat();
http.createServer(function(req, res) {
  if(req.url === '/') {
    fs.readFile('index.html', function(err, data) {
      if(err) throw err;
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.write(data);
      return res.end();
    });
  } else if(req.url === '/style.css') {
    fs.readFile('style.css', function(err, data) {
      if(err) throw err;
      res.writeHead(200, {
        "Content-Type": "text/css"
      });
      res.write(data);
      return res.end();
    });
  }
}).listen(80, '0.0.0.0');
wss.on("connection", (F, req) => {
  Users.add(F);
  SEND(F, LAST);
});
