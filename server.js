const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname;
const types = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'
};
http.createServer((req, res) => {
  let file = path.join(root, req.url === '/' ? 'dashboard.html' : req.url);
  file = file.split('?')[0];
  if (!fs.existsSync(file)) {
    res.writeHead(404, { 'Access-Control-Allow-Origin':'*' });
    return res.end('Not Found: ' + file);
  }
  const ext = path.extname(file);
  res.writeHead(200, { 'Content-Type': types[ext]||'text/plain', 'Access-Control-Allow-Origin':'*' });
  fs.createReadStream(file).pipe(res);
}).listen(3000, () => console.log('Server ready on http://localhost:3000'));
