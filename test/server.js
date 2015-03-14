var http = require('http');
var url = require('url');
var fs = require('fs');
var child_process = require('child_process');
var path = require('path');

function getConcatJs(callback) {
    var concatScriptPath = path.join(__dirname, '..', 'scripts', 'concat-source.sh');
    console.log("running " + concatScriptPath);
    child_process.exec("bash " + concatScriptPath, function (error, stdout, stderr) {
        if (error) {
            callback(error, stdout, stderr);
        } else {
            callback(null, stdout, stderr);
        }
    });
}

var server = http.createServer();
server.on("request", function (req, res) {
    var requestUrl = url.parse(req.url);
    var pathname = requestUrl.pathname;
    if (pathname == '/' || pathname == '') {
        pathname = 'index.html';
    } else if (pathname == '/popup-oauth.js') {
        pathname = '../../popup-oauth.js'
    }

    fs.readFile(path.join(__dirname, 'pages', pathname), {encoding: 'utf-8'}, function (error, data) {
        if (error) {
            res.statusCode = 404;
        } else {
            res.write(data);
        }
        res.end();
    });
});
server.listen(3000, function () {
    console.log("listening");
});
