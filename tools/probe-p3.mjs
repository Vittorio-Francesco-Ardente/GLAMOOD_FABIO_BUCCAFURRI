import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
const req=createRequire(import.meta.url);let pw;try{pw=req('playwright')}catch{pw=req(execSync('npm root -g').toString().trim()+'/playwright')}
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2'};
const prefix='/GLAMOOD_FABIO_BUCCAFURRI';
const server=createServer(async(rq,res)=>{let p=decodeURIComponent(new URL(rq.url,'http://x').pathname).replace(prefix,'');if(!p||p.endsWith('/'))p+='index.html';else if(!extname(p))p+='.html';try{const d=await readFile(join('dist',p));res.writeHead(200,{'content-type':types[extname(p)]||'application/octet-stream'});res.end(d)}catch{res.writeHead(404);res.end('nf')}}).listen(4330,'127.0.0.1');
const browser=await pw.chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
const cfgs=[['desk1440',{viewport:{width:1440,height:900}}],['desk1024',{viewport:{width:1024,height:768}}],['ipad820',{viewport:{width:820,height:1180},hasTouch:true,isMobile:true,deviceScaleFactor:2}],['phone390',{viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3}]];
for(const [name,cfg] of cfgs){
 const ctx=await browser.newContext(cfg);await ctx.addInitScript(()=>sessionStorage.setItem('glamood-intro','1'));
 const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.goto(`http://127.0.0.1:4330${prefix}/prodotti`,{waitUntil:'networkidle'});await page.waitForTimeout(1500);
 await page.locator('.p3-dots button[data-step="3"]').click();await page.waitForTimeout(2500);
 const o=await page.evaluate(async()=>{await document.fonts.ready;const R=e=>{const r=e.getBoundingClientRect();return[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]};
  const cs=(e,p)=>getComputedStyle(e)[p];const k=document.querySelector('.p3-line-k'),bs=[...document.querySelectorAll('.p3-lj b')],ex=document.querySelector('.p3-nb.is-exit'),dots=document.querySelector('.p3-dots'),prev=document.querySelector('.p3-nb[data-dir="-1"]');
  const inter=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
  const rs={k:R(k),b:bs.map(R),ex:R(ex),dots:R(dots),prev:R(prev)};
  const all=[['k',rs.k],...rs.b.map((r,i)=>['b'+i,r]),['ex',rs.ex],['dots',rs.dots],['prev',rs.prev]];const clash=[];for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)if(inter(all[i][1],all[j][1]))clash.push(all[i][0]+'x'+all[j][0]);
  return{bubbleFont:document.fonts.check('40px "Glamood Bubble"'),kFont:cs(k,'fontFamily').slice(0,22),kSize:cs(k,'fontSize'),kCls:k.className,kLabel:k.getAttribute('aria-label'),bFont:cs(bs[0],'fontFamily').slice(0,22),bSize:bs.map(b=>cs(b,'fontSize')),exFont:cs(ex,'fontFamily').slice(0,22),exSize:cs(ex,'fontSize'),exText:ex.textContent.trim(),exSvg:ex.querySelectorAll('svg').length,rects:rs,clash,vw:innerWidth,vh:innerHeight,scrollW:document.documentElement.scrollWidth,inView:all.filter(([n,r])=>r[0]<0||r[2]>innerWidth||r[3]>innerHeight).map(a=>a[0])}});
 console.log('RES',name,JSON.stringify(o));console.log('ERR',name,JSON.stringify(errs));await ctx.close();
}
await browser.close();server.close();
