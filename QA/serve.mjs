import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root=process.argv[2]; const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.json':'application/json','.webmanifest':'application/manifest+json','.mp4':'video/mp4'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);let f=path.join(root,p);
if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
if(!fs.existsSync(f)&&fs.existsSync(f+'.html'))f+='.html';
if(!fs.existsSync(f)){r.writeHead(404);r.end(fs.readFileSync(path.join(root,'404.html')));return;}
r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(4321);
