// Mobile-only regression smoke test. Run after a BASE=/ build.
// Uses the Playwright installed by .github/workflows/mobile-qa.yml.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); }
catch { pw = require(require('node:child_process').execSync('npm root -g').toString().trim() + '/playwright'); }
const { chromium } = pw;
const port = 4329;
const base = (process.env.BASE || '').replace(/\/$/, '');
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.avif':'image/avif','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
const server = createServer(async (req,res)=>{
 let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(base && path.startsWith(base+'/'))path=path.slice(base.length);
 if(path.startsWith('/api/')){res.writeHead(200,{'content-type':'application/json'});return res.end('[]');}
 if(path.endsWith('/'))path+='index.html';
 else if(!extname(path))path+='.html';
 try {const buf=await readFile(join('dist',path));res.writeHead(200,{'content-type':mime[extname(path)]||'application/octet-stream'});res.end(buf);}
 catch{res.writeHead(404);res.end('Not found');}
}).listen(port);
const browser=await chromium.launch({headless:true});
let checks=0;
const check=(condition,msg)=>{assert(condition,msg);checks++;};
const open=async(page,path)=>{await page.goto('http://localhost:'+port+base+path,{waitUntil:'networkidle'});await page.waitForTimeout(300);};
try {
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 await mobile.addInitScript(()=>{try{sessionStorage.setItem('glamood-intro','1')}catch{}});
 const page=await mobile.newPage();
 page.on('pageerror',err=>console.error('BROWSER ERROR:',err.message));
 await open(page,'/storia');
 check(await page.locator('.mobile-reader').isVisible(),'Mobile reader should be visible');
 check(!(await page.locator('#scroller').isVisible()),'Desktop book must be hidden on mobile');
 check((await page.locator('#mobile-page').getAttribute('aria-label')).includes('Copertina'),'Cover is the first mobile page');
 await page.locator('#st-next').click();
 check((await page.locator('#mobile-page').getAttribute('aria-label')).includes('Dedica'),'Next advances by one readable page');
 await page.locator('#st-next').click();
 check((await page.locator('#mobile-page').getAttribute('aria-label')).includes('Gli inizi'),'Second advance reaches chapter 1');
 const flat=await page.locator('#mobile-page>.face').evaluate(el=>getComputedStyle(el).transform);
 check(flat==='none','Mobile page is flat rather than flipped/mirrored');
 await open(page,'/');
 await page.locator('#burger').click();
 check(await page.locator('#menu').evaluate(el=>el.classList.contains('open')),'Menu opens');
 await page.locator('#menu').evaluate(el=>el.scrollTop=el.scrollHeight);
 await page.waitForTimeout(200);
 const last=await page.locator('#menu .pills a').last().boundingBox();
 check(last && last.y>=0 && last.y+last.height<=844,'Last mobile menu link must be reachable');
 await page.locator('#menu-close').click();
 await page.locator('#foot').scrollIntoViewIfNeeded();
 await page.waitForTimeout(400);
 check(await page.locator('.sx-header').evaluate(el=>el.classList.contains('at-footer')),'Phone dock must hide over footer');
 check(await page.evaluate(()=>getComputedStyle(document.body).paddingBottom==='0px'),'No double bottom padding');
 await open(page,'/prodotti');
 const separation=await page.evaluate(()=>{
  const item=document.querySelector('.t3.on');
  if(!item)return null;
  const p=item.querySelector('.pt.p2').getBoundingClientRect(),d=item.querySelector('.t3-desc').getBoundingClientRect();
  return p.bottom<=d.top || p.top>=d.bottom || p.right<=d.left || p.left>=d.right;
 });
 check(separation===true,'Product decoration must not cover its caption on phone');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 check(overflow<=2,'No page-wide horizontal overflow on products');
 await page.close();await mobile.close();
 const desk=await browser.newContext({viewport:{width:1440,height:900}});
 const desktop=await desk.newPage();
 await open(desktop,'/storia');
 check(await desktop.locator('#scroller').isVisible(),'Original 3D book remains on desktop');
 check(!(await desktop.locator('.mobile-reader').isVisible()),'Mobile reader stays hidden on desktop');
 await desktop.close();await desk.close();
 console.log('Mobile/desktop smoke tests passed:',checks);
} finally {await browser.close();server.close();}
