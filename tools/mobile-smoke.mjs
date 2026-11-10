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
 const svgSource = await readFile('src/components/loader-art.txt','utf8');
 check(!svgSource.includes('ld-sheen')&&!svgSource.includes('ld-clip'),'Loader artwork must not contain reflective shine');
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
 const navVisible=()=>page.locator('#barra').evaluate(el=>{const c=getComputedStyle(el),r=el.getBoundingClientRect();return Number(c.opacity)>.95 && c.pointerEvents==='auto' && r.top>=0 && r.bottom<=innerHeight+1;});
 check(await navVisible(),'Mobile navbar is visible immediately at the top');
 check(await page.locator('#h-ds').count()===1,'Non-foliage scissor decoration remains in source; its existing mobile visibility rule stays unchanged');
 check(await page.evaluate(()=>[...document.querySelectorAll('#h-dm,#h-dm2,#h-dk,.manifesto img.leaf,#foot img.leaf-frame')].length===6 && [...document.querySelectorAll('#h-dm,#h-dm2,#h-dk,.manifesto img.leaf,#foot img.leaf-frame')].every(el=>getComputedStyle(el).display==='none')),'Only decorative foliage is disabled on home and footer');
 // Bigger mobile bar must have legible icons, visible labels and six touch targets.
 await page.evaluate(() => { window.lenis?.scrollTo(160,{immediate:true}); window.scrollTo(0,160); });
 await page.waitForTimeout(850);
 const bar = await page.locator('#barra').evaluate(el=>{
  const rect=el.getBoundingClientRect(), css=getComputedStyle(el);
  const links=[...el.querySelectorAll('a.voce')].map(a=>{
   const box=a.getBoundingClientRect(),svg=a.querySelector('svg').getBoundingClientRect();
   return {height:box.height,width:box.width,svg:svg.width,label:getComputedStyle(a.querySelector('span')).opacity};
  });
  return {width:rect.width,height:rect.height,opacity:parseFloat(css.opacity),links};
 });
 check(bar.width>=340 && bar.height>=75,'Mobile navbar must occupy a readable full-width pill');
 check(bar.links.length===6 && bar.links.every(v=>v.height>=66 && v.svg>=26 && Number(v.label)>=.9),'All six mobile navigation icons and labels must be visible and tap-sized');
 check(bar.opacity>.9,'Mobile navigation should remain visible after scrolling');
 await page.evaluate(()=>{window.lenis?.scrollTo(900,{immediate:true});window.scrollTo(0,900)});
 await page.waitForTimeout(400);
 check(await navVisible(),'Mobile navbar stays visible while scrolling down');
 await page.evaluate(()=>{window.lenis?.scrollTo(0,{immediate:true});window.scrollTo(0,0)});
 await page.waitForTimeout(320);
 await page.locator('#burger').click();
 check(await page.locator('#menu').evaluate(el=>el.classList.contains('open')),'Menu opens');
 check(await page.locator('#barra').evaluate(el=>getComputedStyle(el).pointerEvents==='none'),'Nav stays inert while fullscreen menu is open');
 await page.locator('#menu').evaluate(el=>el.scrollTop=el.scrollHeight);
 await page.waitForTimeout(200);
 const last=await page.locator('#menu .pills a').last().boundingBox();
 check(last && last.y>=0 && last.y+last.height<=844,'Last mobile menu link must be reachable');
 await page.locator('#menu-close').click();
 await page.locator('#foot').scrollIntoViewIfNeeded();
 await page.waitForTimeout(400);
 check(await navVisible(),'Mobile navbar remains visible when footer enters viewport');
 await page.evaluate(()=>{window.lenis?.scrollTo(document.documentElement.scrollHeight,{immediate:true});window.scrollTo(0,document.documentElement.scrollHeight)});
 await page.waitForTimeout(350);
 check(await navVisible(),'Mobile navbar remains visible at absolute bottom of page');
 check(await page.locator('#foot .legal').evaluate(el=>parseFloat(getComputedStyle(el).paddingBottom)>=110),'Footer retains clearance below its final links');
 check(await page.evaluate(()=>getComputedStyle(document.body).paddingBottom==='0px'),'No double bottom padding');
 await open(page,'/salone');
 check(await page.locator('.sx-salone img.hang').evaluate(el=>getComputedStyle(el).display==='none'),'Salone hanging foliage is disabled');
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
 // The VHS carousel must have exactly eight physical cassettes (no cloned copies)
 // and all 32 photo/cover textures must load under the GitHub Pages base URL.
 await open(page,'/tagli');
 const tapes=page.locator('#tg-stage>.tape');
 check(await tapes.count()===8,'VHS shelf must contain exactly eight cassettes on mobile');
 const result=await page.evaluate(async ()=>{
   const keys=JSON.parse(document.getElementById('tagli-data').textContent).CUTS.map(c=>c[1]);
   const unique=new Set(keys);
   const prefix=location.pathname.slice(0,location.pathname.lastIndexOf('/'))+'/img/tagli/';
   const names=keys.flatMap(k=>['spine','front','lato','foto'].map(x=>k+'-'+x+'.webp'));
   const images=await Promise.all(names.map(async name=>{
     const response=await fetch(prefix+name);
     const data=await response.blob();
     return {name,status:response.status,valid:response.ok && data.size>1000 && data.type.startsWith('image/')};
   }));
   const cover=([...document.querySelectorAll('#tg-stage>.tape .face.cv')][0]).style.getPropertyValue('--tex');
   return {keys:keys.length,unique:unique.size,images,cover,prefix};
 });
 check(result.keys===8 && result.unique===8,'Every VHS must represent one distinct haircut');
 check(result.images.length===32 && result.images.every(x=>x.valid),'All 8 haircut photographs, sleeves, sides and spines must load');
 check(result.cover.includes(result.prefix),'Cassette cover must resolve inside the GitHub Pages project subpath');
 // Open a centered VHS by keyboard, then close by real tap on X.
 await page.locator('#shelf').focus();
 await page.keyboard.press('Enter');
 await page.locator('#tg-sheet').waitFor({state:'visible'});
 check(await page.locator('#sx').isVisible(),'Close X must be visible when VHS opens');
 const loaded=await page.locator('#simg').evaluate(async img=>{try{await img.decode()}catch{}return img.complete&&img.naturalWidth>0;});
 check(loaded,'Haircut photo loads and decodes when detail opens');
 check(await page.locator('#photo-state').isHidden(),'Loading indicator disappears after photo loads');
 await page.locator('#sx').click({timeout:4000});
 check(await page.locator('#tg-sheet').isHidden(),'X closes sheet immediately on phone');
 check(await page.evaluate(()=>document.documentElement.style.overflow!=='hidden'),'Closing X unlocks page scroll');
 // A later cassette opens its own photo without teleporting the shelf.
 await page.locator('#shelf').focus();
 for(let i=0;i<3;i++) await page.keyboard.press('ArrowRight');
 await page.waitForTimeout(900);
 const before=await page.locator('#tg-stage>.tape[data-v="3"]').evaluate(el=>el.style.transform);
 await page.locator('#tg-stage>.tape[data-v="3"] .face.cv').dispatchEvent('click');
 await page.locator('#tg-sheet').waitFor({state:'visible'});
 const chosen=await page.locator('#simg').getAttribute('src');
 const expected=await page.evaluate(()=>{const c=JSON.parse(document.getElementById('tagli-data').textContent).CUTS[3];return c[1]+'-foto.webp'});
 check(chosen.endsWith(expected),'Tapping tape 4 opens tape 4 photo rather than the previous active cut');
 check(await page.locator('#tg-stage>.tape[data-v="3"]').evaluate((el,before)=>el.style.transform===before,before),'Tapping a VHS does not move the shelf behind the dialog');
 await page.locator('#sx').click({timeout:4000});
 check(await page.locator('#tg-sheet').isHidden(),'X closes the fourth VHS too');
 await page.close();await mobile.close();

 const desk=await browser.newContext({viewport:{width:1440,height:900}});
 const desktop=await desk.newPage();
 await open(desktop,'/storia');
 check(await desktop.locator('#scroller').isVisible(),'Original 3D book remains on desktop');
 check(!(await desktop.locator('.mobile-reader').isVisible()),'Mobile reader stays hidden on desktop');
 await open(desktop,'/');
 check(await desktop.locator('#h-ds').isVisible(),'Non-foliage decorations remain on desktop');
 check(await desktop.locator('#foot img.leaf-frame').evaluateAll(els=>els.length===2&&els.every(el=>getComputedStyle(el).display==='none')),'Footer foliage is hidden on desktop too');
 await open(desktop,'/tagli');
 check(await desktop.locator('#tg-stage>.tape').count()===8,'Desktop also uses eight unique VHS');
 await desktop.locator('#shelf').focus();await desktop.keyboard.press('Enter');
 await desktop.locator('#tg-sheet').waitFor({state:'visible'});
 await desktop.locator('#sx').click({timeout:4000});
 check(await desktop.locator('#tg-sheet').isHidden(),'Desktop X immediately closes VHS detail');
 await desktop.close();await desk.close();
 // Fresh session: intro must self-dismiss quickly even if the full page load is slow.
 const fresh=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const first=await fresh.newPage();
 await first.goto('http://localhost:'+port+base+'/',{waitUntil:'domcontentloaded'});
 await first.waitForTimeout(1650);
 check(!(await first.evaluate(()=>document.documentElement.classList.contains('loading'))),'Loader must release the page within 1.65 seconds');
 check((await first.evaluate(()=>sessionStorage.getItem('glamood-intro')))==='1','Loader should mark its completion');
 await first.reload({waitUntil:'domcontentloaded'});
 await first.waitForTimeout(100);
 check(!(await first.locator('#intro').isVisible()),'Loader must not replay on same-session navigation');
 await first.close();await fresh.close();
 console.log('Mobile/desktop smoke tests passed:',checks);
} finally {await browser.close();server.close();}
