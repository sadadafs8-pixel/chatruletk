import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,app:'CASE CLASH'}));return;}
  const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
  const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(body);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
}).listen(process.env.PORT||3000,'0.0.0.0');
