import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express(); const server=http.createServer(app); const io=new Server(server);
app.use(express.static(path.join(__dirname,'public')));
const waiting=[]; const users=new Map();
function leave(id){ const i=waiting.indexOf(id); if(i>=0) waiting.splice(i,1); const u=users.get(id); if(u?.peer){ const p=users.get(u.peer); if(p){p.peer=null;io.to(p.id).emit('peer-left');} u.peer=null; } }
function match(id){ const u=users.get(id); if(!u)return; leave(id); let idx=waiting.findIndex(pid=>{const p=users.get(pid); if(!p||p.peer)return false; if(u.admin&&u.target!=='all'&&p.gender!==u.target)return false; return true;}); if(idx<0){waiting.push(id);io.to(id).emit('waiting');return;} const pid=waiting.splice(idx,1)[0],p=users.get(pid);u.peer=pid;p.peer=id;io.to(id).emit('matched',{peer:pid,initiator:true});io.to(pid).emit('matched',{peer:id,initiator:false});}
io.on('connection',s=>{users.set(s.id,{id:s.id,gender:null,peer:null,admin:false,target:'all'});s.on('join',d=>{const u=users.get(s.id);u.gender=d.gender==='female'?'female':'male';u.admin=Boolean(process.env.ADMIN_KEY&&d.adminKey===process.env.ADMIN_KEY);u.target=u.admin&&['male','female','all'].includes(d.target)?d.target:'all';match(s.id);});s.on('next',()=>match(s.id));s.on('signal',d=>{const u=users.get(s.id);if(u?.peer)io.to(u.peer).emit('signal',d);});s.on('disconnect',()=>{leave(s.id);users.delete(s.id);});});
app.get('/health',(q,r)=>r.json({ok:true,online:users.size,waiting:waiting.length}));
server.listen(process.env.PORT||3000,'0.0.0.0');