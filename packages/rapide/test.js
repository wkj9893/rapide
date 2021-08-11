const http = require('http')


function createServer(){
  const server = http.createServer((req,res)=>{
    res.writeHead(200,{
      "Content-Type":"text/html"
    }).end('<h1>hello<h1>')
})

let port = 3000
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Address in use, retrying ${port+1}`);
    server.close();
    server.listen(++port);
  }
});

server.listen(port)
}


createServer()