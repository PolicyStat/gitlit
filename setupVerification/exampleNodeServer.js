/**
 * Created by Devon Timaeus on 9/21/2014.
 */

var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
}).listen(1337, '127.0.0.1');

console.log('Server running at 127.0.0.1:1337/');
