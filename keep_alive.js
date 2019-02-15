const http = require('http');

http.createServer((req, res) => {
  res.write("I'm alive");
  res.end();
}).listen(8080);

process.on( 'SIGTERM', function () {
   server.close(function () {
     console.log("Finished all requests");
   });
});