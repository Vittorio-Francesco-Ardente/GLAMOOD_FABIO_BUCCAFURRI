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
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined});
let checks=0;
const check=(condition,msg)=>{assert(condition,msg);checks++;};
const open=async(page,path)=>{await page.goto('http://localhost:'+port+base+path,{waitUntil:'networkidle'});await page.waitForTimeout(300);};
try {
 const svgSource = await readFile('src/components/loader-art.txt','utf8');
 check(!svgSource.includes('ld-sheen')&&!svgSource.includes('ld-clip'),'Loader artwork must not contain reflective shine');
 check((svgSource.match(/class="ld-letter"/g)||[]).length===7,'The brand vector is split into seven left-to-right letter sections');
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
 // The real photo and cartoon have different contours at the raised right
 // elbow. Force the animated cloud to cross that region and verify the pixels
 // remain cartoon-only throughout the elbow, with no photo bleeding through.
 const heroResult=await page.locator('#fig').evaluate(async fig=>{
   const box=fig.getBoundingClientRect();
   const pointX=box.left+box.width*.85,pointY=box.top+box.height*.39;
   fig.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:pointX,clientY:pointY}));
   const photo=document.getElementById('photo');
   const toon=new Image();toon.src=(photo.currentSrc||photo.src).replace('fabio-foto','fabio-cartoon');
   await toon.decode();
   await new Promise(resolve=>setTimeout(resolve,120));
   const cv=document.getElementById('cv');
   const W=cv.width,H=cv.height,pad=.45/1.9;
   const R=[W*pad,H*pad,W*(1-2*pad),H*(1-2*pad)];
   const off=document.createElement('canvas');off.width=W;off.height=H;
   const context=off.getContext('2d',{willReadFrequently:true});
   context.drawImage(toon,...R);
   const current=cv.getContext('2d',{willReadFrequently:true});
   let opaque=0,mismatched=0;
   for(let j=0;j<=9;j++)for(let i=0;i<=9;i++){
     const xi=.74+i*.024,yi=.22+j*.032;
     const x=Math.round(R[0]+R[2]*xi),y=Math.round(R[1]+R[3]*yi);
     const expected=context.getImageData(x,y,1,1).data;
     if(expected[3]<245)continue;
     opaque++;
     const shown=current.getImageData(x,y,1,1).data;
     if(Math.abs(expected[0]-shown[0])>6||Math.abs(expected[1]-shown[1])>6||
        Math.abs(expected[2]-shown[2])>6||Math.abs(expected[3]-shown[3])>6)mismatched++;
   }
   return {opaque,mismatched};
 });
 check(heroResult.opaque>25&&heroResult.mismatched===0,
   'Cloud keeps the entire right elbow as cartoon, with no photorealistic pixels showing');
 const navVisible=()=>page.locator('#barra').evaluate(el=>{const c=getComputedStyle(el),r=el.getBoundingClientRect();return Number(c.opacity)>.95 && c.pointerEvents==='auto' && r.top>=0 && r.bottom<=innerHeight+1;});
 check(!(await navVisible()),'Mobile navbar must start hidden at the top');
 check(await page.locator('#barra').evaluate(el=>getComputedStyle(el).pointerEvents==='none'),'Hidden navbar must not intercept taps');
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
 check(bar.width>=340 && bar.height>=60 && bar.height<=72,'Phone navbar is compact without losing tap targets');
 check(bar.links.length===6 && bar.links.every(v=>v.height>=50 && v.height<=56 && v.svg>=19 && v.svg<=21 && Number(v.label)>=.9),'All six compact mobile navigation buttons and labels remain legible');
 // Verify the full label fits within its own link across phone widths.
 for(const width of [320,360,390,428]){
   await page.setViewportSize({width,height:844});
   await page.waitForTimeout(120);
   const fit=await page.locator('#barra').evaluate(el=>{
     const outer=el.getBoundingClientRect();
     const anchors=[...el.querySelectorAll('a.voce')];
     return {overflow:outer.left < -1 || outer.right > innerWidth+1,
       fits:anchors.every(a=>{
         const text=a.querySelector('span'),b=a.getBoundingClientRect(),tb=text.getBoundingClientRect();
         return text.scrollWidth<=text.clientWidth+1 && tb.left>=b.left-1 && tb.right<=b.right+1;
       })};
   });
   check(!fit.overflow && fit.fits,'All six tab labels fit without clipping at '+width+'px');
 }
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(120);
 check(bar.opacity>.9,'Mobile navigation should remain visible after scrolling');
 await page.evaluate(()=>{window.lenis?.scrollTo(900,{immediate:true});window.scrollTo(0,900)});
 await page.waitForTimeout(400);
 check(await navVisible(),'Mobile navbar stays visible while scrolling down');
 await page.evaluate(()=>{window.lenis?.scrollTo(0,{immediate:true});window.scrollTo(0,0)});
 await page.waitForTimeout(320);
 check(!(await navVisible()),'Phone navbar hides again only after returning to the very top');
 await page.locator('#burger').click();
 check(await page.locator('#menu').evaluate(el=>el.classList.contains('open')),'Menu opens');
 check(await page.locator('#barra').evaluate(el=>getComputedStyle(el).pointerEvents==='none'),'Nav stays inert while fullscreen menu is open');
 // Mobile menu must look like the desktop typography, not six translucent button cards.
 check(await page.locator('#menu .pills').isHidden(),'Phone menu hides the bottom contact/action buttons');
 check(await page.locator('#menu .top').evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius)>=18),'Menu header has rounded corners');
 check(await page.locator('#menu li a').count()===6,'All six menu destinations remain available');
 check(await page.locator('#menu li a').evaluateAll(els=>els.every(a=>{
   const cs=getComputedStyle(a);
   return cs.backgroundColor==='rgba(0, 0, 0, 0)' && parseFloat(cs.borderTopWidth)===0 && cs.textAlign!=='left';
 })),'Phone menu uses borderless centered text rather than boxed buttons');
 for(const size of [{width:320,height:568},{width:360,height:667},{width:390,height:844},{width:428,height:926}]){
   await page.setViewportSize(size);
   await page.waitForTimeout(110);
   const layout=await page.locator('#menu').evaluate(menu=>{
     const top=menu.querySelector('.top').getBoundingClientRect();
     const close=menu.querySelector('#menu-close').getBoundingClientRect();
     const links=[...menu.querySelectorAll('li a')].map(a=>a.getBoundingClientRect());
     const body=menu.getBoundingClientRect();
     return {topRadius:parseFloat(getComputedStyle(menu.querySelector('.top')).borderTopLeftRadius),
       contained:links.every(x=>x.left>=body.left-1&&x.right<=body.right+1),
       centered:links.every(x=>Math.abs((x.left+x.right)/2-(body.left+body.right)/2)<3),
       closeInside:close.left>=top.left && close.right<=top.right && close.bottom<=top.bottom,
       fits:links[0].top>=top.bottom && links[links.length-1].bottom<=body.bottom,
       noOverlap:links.every((x,i)=>i===0||x.top>=links[i-1].bottom-1)
     };
   });
   check(layout.topRadius>=18&&layout.contained&&layout.centered&&layout.closeInside&&layout.fits&&layout.noOverlap,
     'Centered menu fits with rounded header at '+size.width+'x'+size.height);
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('#menu-close').click();
 await page.locator('#foot').scrollIntoViewIfNeeded();
 await page.waitForTimeout(400);
 check(await navVisible(),'Mobile navbar remains visible when footer enters viewport');
 const mascotGap=await page.locator('#foot').evaluate(el=>{
   const mascot=el.querySelector('.peekwrap').getBoundingClientRect();
   const card=el.querySelector('.cta').getBoundingClientRect();
   const buttons=[...el.querySelectorAll('.cta a')].map(a=>a.getBoundingClientRect());
   return {gap:card.top-mascot.bottom,buttonsClear:buttons.every(b=>b.top>=card.top && b.top>=mascot.bottom+8)};
 });
 check(mascotGap.gap<=-4 && mascotGap.gap>=-22 && mascotGap.buttonsClear,
   'On phones the mascot must grip the card edge without covering its buttons');
 await page.evaluate(()=>{window.lenis?.scrollTo(document.documentElement.scrollHeight,{immediate:true});window.scrollTo(0,document.documentElement.scrollHeight)});
 await page.waitForTimeout(350);
 check(await navVisible(),'Mobile navbar remains visible at absolute bottom of page');
 check(await page.locator('#foot .legal').evaluate(el=>parseFloat(getComputedStyle(el).paddingBottom)>=110),'Footer retains clearance below its final links');
 check(await page.evaluate(()=>getComputedStyle(document.body).paddingBottom==='0px'),'No double bottom padding');
 await open(page,'/salone');
 check(await page.locator('.sx-salone img.hang').evaluate(el=>getComputedStyle(el).display==='none'),'Salone hanging foliage is disabled');
 // The listino used to squeeze 25px prices against long service names on iPhone.
 // Check real geometric separation at small iPhone sizes, not only CSS strings.
 await open(page,'/listino');
 for(const viewport of [{width:320,height:568},{width:360,height:667},{width:390,height:844},{width:428,height:926}]){
   await page.setViewportSize(viewport);
   await page.locator('#tk .ticket').first().scrollIntoViewIfNeeded();
   await page.waitForTimeout(750);
   const layout=await page.locator('#tk .ticket').first().evaluate(ticket=>{
     const box=ticket.getBoundingClientRect();
     const rows=[...ticket.querySelectorAll('li')];
     const priceSafe=rows.every(li=>{
       const name=li.querySelector('span').getBoundingClientRect(),price=li.querySelector('b').getBoundingClientRect();
       return name.right<=price.left-6 && price.right<=box.right-8 &&
         name.left>=box.left+8 && getComputedStyle(li).display==='grid';
     });
     const title=ticket.querySelector('h3').getBoundingClientRect();
     return {priceSafe,inside:box.left>=-1&&box.right<=innerWidth+1,
       titleInside:title.left>=box.left-1&&title.right<=box.right+1,
       overflow:document.documentElement.scrollWidth-innerWidth,
       rowCount:rows.length};
   });
   check(layout.rowCount>0&&layout.priceSafe&&layout.inside&&layout.titleInside&&layout.overflow<=2,
     'Phone listino keeps full labels, prices and ticket within '+viewport.width+'px');
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('#tk .ticket').first().click();
 await page.locator('#lz').waitFor({state:'visible'});
 check(await page.locator('#lz-card, #lzCard').count()>=1,'Price details remain accessible after mobile layout changes');
 const detail=await page.locator('#lzCard').evaluate(card=>({
   inside:card.getBoundingClientRect().left>=-1&&card.getBoundingClientRect().right<=innerWidth+1,
   rows:[...card.querySelectorAll('dt')].every(x=>x.querySelector('b')&&x.querySelector('b').getBoundingClientRect().left>=x.getBoundingClientRect().left)
 }));
 check(detail.inside&&detail.rows,'Detailed mobile price rows stay aligned without horizontal overflow');
 await page.locator('#lzX').click();
 await page.locator('#lz').waitFor({state:'hidden'});
 await open(page,'/prodotti');
 const separation=await page.evaluate(()=>{
  const item=document.querySelector('.t3.on');
  if(!item)return null;
  const p=item.querySelector('.pt.p2').getBoundingClientRect(),d=item.querySelector('.t3-desc').getBoundingClientRect();
  return p.bottom<=d.top || p.top>=d.bottom || p.right<=d.left || p.left>=d.right;
 });
 check(separation===true,'Product decoration must not cover its caption on phone');
 // Regression: opening "COME SI USA" must never collide with the product name,
 // jar or previous/next controls (the actual iPhone bug).
 await page.locator('#top3').scrollIntoViewIfNeeded();
 for(const viewport of [{width:390,height:844},{width:360,height:667},{width:320,height:568}]){
   await page.setViewportSize(viewport);
   await page.locator('#top3 .t3-dots button[data-i="1"]').click();
   await page.waitForTimeout(1450);
   const details=page.locator('#top3 .t3.on .t3-acc details').first();
   if(!(await details.evaluate(el=>el.open))) await details.locator('summary').click();
   await page.waitForTimeout(200);
   const geometry=await page.locator('#top3').evaluate(el=>{
     const active=el.querySelector('.t3.on');
     const desc=active.querySelector('.t3-desc').getBoundingClientRect();
     const acc=active.querySelector('.t3-acc').getBoundingClientRect();
     const jar=active.querySelector('.t3-jar').getBoundingClientRect();
     const nav=el.querySelector('.t3-nav').getBoundingClientRect();
     return {descToAcc:acc.top-desc.bottom,accToNav:nav.top-acc.bottom,
       jarToDesc:desc.top-jar.bottom,opened:active.querySelector('.t3-acc details').open,
       within:desc.left>=-1&&acc.right<=innerWidth+1};
   });
   check(geometry.opened && geometry.descToAcc>=10 && geometry.accToNav>=10 &&
     geometry.jarToDesc>=8 && geometry.within,
     'Expanded Pomata instructions must not overlap its title, jar or navigation at '+viewport.width+'x'+viewport.height);
 }
 await page.setViewportSize({width:390,height:844});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 check(overflow<=2,'No page-wide horizontal overflow on products');
 // The VHS carousel must have exactly eight physical cassettes (no cloned copies)
 // and all 32 photo/cover textures must load under the GitHub Pages base URL.
 await open(page,'/tagli');
 const heroClearance=await page.locator('#testa').evaluate(header=>{
   const h=header.getBoundingClientRect(), t=document.getElementById('tagli-t').getBoundingClientRect();
   return t.top-h.bottom;
 });
 check(heroClearance>=12,'Phone VHS title starts below the floating header without collision');
 await page.evaluate(()=>{window.lenis?.scrollTo(32,{immediate:true});window.scrollTo(0,32)});
 await page.waitForTimeout(400);
 check(await page.locator('#testa').evaluate(el=>getComputedStyle(el).visibility==='hidden' && getComputedStyle(el).opacity==='0'),
   'Phone header disappears promptly on the first scroll');
 check(await page.locator('#barra').evaluate(el=>getComputedStyle(el).pointerEvents==='none'),
   'Phone dock remains hidden until its original scroll threshold');
 await page.evaluate(()=>{window.lenis?.scrollTo(0,{immediate:true});window.scrollTo(0,0)});
 await page.waitForTimeout(350);
 const tapes=page.locator('#tg-stage>.tape');
 check(await tapes.count()===8,'VHS shelf must contain exactly eight cassettes on mobile');
 check(await page.locator('#tg-stage>.tape[data-v="4"]').evaluate(el=>/^translate3d\(0(?:\.00)?px,/.test(el.style.transform)),
   'Phone shelf starts with its middle VHS aligned to the center');
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
 const mobileModal=await page.locator('#tg-sheet').evaluate(el=>{
   const photo=el.querySelector('.big').getBoundingClientRect();
   const close=el.querySelector('#sx').getBoundingClientRect();
   const st=getComputedStyle(el);
   el.scrollTop=el.scrollHeight;
   return {native:el.hasAttribute('data-lenis-prevent')&&st.overflowY==='auto'&&st.touchAction==='pan-y',
     photoHeight:photo.height, viewport:innerHeight, xReachable:close.top>=0&&close.bottom<=innerHeight,
     scrollable:el.scrollHeight<=el.clientHeight+2||el.scrollTop>0};
 });
 check(mobileModal.native&&mobileModal.photoHeight<=mobileModal.viewport*.47&&
   mobileModal.xReachable&&mobileModal.scrollable,
   'Phone VHS details can scroll natively and the photo and X fit within the viewport');
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
 const before=await page.locator('#tg-stage>.tape[data-v="7"]').evaluate(el=>el.style.transform);
 await page.locator('#tg-stage>.tape[data-v="7"] .face.cv').dispatchEvent('click');
 await page.locator('#tg-sheet').waitFor({state:'visible'});
 const chosen=await page.locator('#simg').getAttribute('src');
 const expected=await page.evaluate(()=>{const c=JSON.parse(document.getElementById('tagli-data').textContent).CUTS[7];return c[1]+'-foto.webp'});
 check(chosen.endsWith(expected),'The selected later cassette opens the correct photo rather than the previous cut');
 const shelfShift=await page.locator('#tg-stage>.tape[data-v="7"]').evaluate((el,prev)=>{
   const position=s=>{const start=s.indexOf('translate3d(');if(start<0)return null;return s.slice(start+12,s.indexOf(')',start+12)).split(',').map(v=>parseFloat(v))};
   const a=position(prev),b=position(el.style.transform);
   return a&&b?Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]):Infinity;
 },before);
 check(shelfShift<=3,'Tapping a VHS must not jump the shelf (movement '+shelfShift.toFixed(2)+'px)');
 await page.locator('#sx').click({timeout:4000});
 check(await page.locator('#tg-sheet').isHidden(),'X closes a later VHS too');
 await page.close();await mobile.close();

 const desk=await browser.newContext({viewport:{width:1440,height:900}});
 const desktop=await desk.newPage();
 await open(desktop,'/storia');
 check(await desktop.locator('#scroller').isVisible(),'Original 3D book remains on desktop');
 check(!(await desktop.locator('.mobile-reader').isVisible()),'Mobile reader stays hidden on desktop');
 const captions=await desktop.locator('.pg.duo .photo').first().evaluate(photo=>{
   const img=photo.querySelector('img'),cap=photo.querySelector('figcaption');
   return getComputedStyle(cap).position==='static' && cap.offsetTop>=img.offsetTop+img.offsetHeight-2 && cap.offsetTop+cap.offsetHeight<=photo.clientHeight+2;
 });
 check(captions,'Desktop book keeps Polaroid captions entirely below their photos');
 await open(desktop,'/');
 check(await desktop.locator('#h-ds').isVisible(),'Non-foliage decorations remain on desktop');
 // Header navigation must be centered against the page, not between unequal side groups.
 for(const width of [1024,1280,1440]){
   await desktop.setViewportSize({width,height:900});
   const navGeometry=await desktop.locator('#testa').evaluate(el=>{
     const h=el.getBoundingClientRect(), links=el.querySelector('.links').getBoundingClientRect();
     const mark=el.querySelector('.mark').getBoundingClientRect();
     const actions=el.querySelector('.soc').getBoundingClientRect();
     return {centerOffset:Math.abs((links.left+links.right)/2-(h.left+h.right)/2),
       clearLeft:links.left>=mark.right+4,clearRight:links.right<=actions.left-4};
   });
   check(navGeometry.centerOffset<=2&&navGeometry.clearLeft&&navGeometry.clearRight,
     'Top navigation is centered without collisions at '+width+'px');
 }
 await desktop.setViewportSize({width:1440,height:900});
 check(await desktop.locator('#foot img.leaf-frame').evaluateAll(els=>els.length===2&&els.every(el=>getComputedStyle(el).display==='none')),'Footer foliage is hidden on desktop too');
 await open(desktop,'/tagli');
 check(await desktop.locator('#tg-stage>.tape').count()===16,'Desktop fills the shelf with sixteen VHS, repeating the eight originals');
 check(await desktop.locator('#tg-stage>.tape[data-v="8"]').evaluate(el=>/^translate3d\(0(?:\.00)?px,/.test(el.style.transform)),
   'Desktop shelf starts from its middle VHS rather than the left end');
 await desktop.locator('#shelf').focus();await desktop.keyboard.press('Enter');
 await desktop.locator('#tg-sheet').waitFor({state:'visible'});
 await desktop.locator('#sx').click({timeout:4000});
 check(await desktop.locator('#tg-sheet').isHidden(),'Desktop X immediately closes VHS detail');
 await desktop.locator('#shelf').focus();await desktop.keyboard.press('ArrowRight');
 await desktop.waitForTimeout(850);await desktop.keyboard.press('Enter');
 await desktop.locator('#tg-sheet').waitFor({state:'visible'});
 const repeatedSrc=await desktop.locator('#simg').getAttribute('src');
 const secondCut=await desktop.evaluate(()=>JSON.parse(document.getElementById('tagli-data').textContent).CUTS[1][1]);
 check(repeatedSrc.endsWith(secondCut+'-foto.webp'),'Repeated desktop VHS opens its corresponding haircut');
 await desktop.locator('#sx').click({timeout:4000});
 await desktop.close();await desk.close();
 const tabCtx=await browser.newContext({viewport:{width:820,height:1180}});
 await tabCtx.addInitScript(()=>{try{sessionStorage.setItem('glamood-intro','1')}catch{}});
 const tablet=await tabCtx.newPage();
 await open(tablet,'/');
 const tabletMascot=await tablet.locator('#foot').evaluate(el=>{
   const m=el.querySelector('.peekwrap').getBoundingClientRect();
   const card=el.querySelector('.cta').getBoundingClientRect();
   const btn=el.querySelector('.cta a').getBoundingClientRect();
   return {overlap:m.bottom-card.top,centered:Math.abs((m.left+m.right-card.left-card.right)/2)<2,clear:btn.top>=m.bottom+8};
 });
 check(tabletMascot.overlap>=4&&tabletMascot.overlap<=22&&tabletMascot.centered&&tabletMascot.clear,
   'Tablet mascot grips the center of its CTA card without covering its buttons');
 await open(tablet,'/tagli');
 const tabletClearance=await tablet.locator('#testa').evaluate(el=>
   document.getElementById('tagli-t').getBoundingClientRect().top-el.getBoundingClientRect().bottom);
 check(tabletClearance>=16,'Tablet VHS title does not collide with the header');
 check(await tablet.locator('#tg-stage>.tape').count()===8 &&
   await tablet.locator('#tg-stage>.tape[data-v="4"]').evaluate(el=>/^translate3d\(0(?:\.00)?px,/.test(el.style.transform)),
   'Tablet shelf also opens on its middle cassette');
 await tablet.locator('#shelf').focus();
 await tablet.keyboard.press('Enter');
 await tablet.locator('#tg-sheet').waitFor({state:'visible'});
 check(await tablet.locator('#tg-sheet').evaluate(el=>{
   const p=el.querySelector('.big').getBoundingClientRect();
   return getComputedStyle(el).overflowY==='auto'&&p.height<=innerHeight*.46&&el.hasAttribute('data-lenis-prevent');
 }), 'Tablet VHS detail stays compact and scrollable');
 await tablet.locator('#sx').click({timeout:4000});
 check(await tablet.locator('#tg-sheet').isHidden(),'Tablet close X releases the modal');
 await tablet.close();await tabCtx.close();
 // Fresh session: intro must self-dismiss quickly even if the full page load is slow.
 const fresh=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const first=await fresh.newPage();
 await first.goto('http://localhost:'+port+base+'/',{waitUntil:'domcontentloaded'});
 await first.waitForTimeout(150);
 const letterSequence=await first.locator('#intro .ld-letter').evaluateAll(els=>els.map(el=>{
   const css=getComputedStyle(el);return {name:css.animationName,delay:parseFloat(css.animationDelay)};
 }));
 check(letterSequence.length===7 && letterSequence.every((x,i)=>x.name.includes('ld-letter-pop') && (i===0 || x.delay>letterSequence[i-1].delay)),
   'Loader builds seven letters left to right using Ardake-style stagger without reflection');
 await first.waitForTimeout(1500);
 check(!(await first.evaluate(()=>document.documentElement.classList.contains('loading'))),'Loader must release the page within 1.65 seconds');
 check((await first.evaluate(()=>sessionStorage.getItem('glamood-intro')))==='1','Loader should mark its completion');
 await first.reload({waitUntil:'domcontentloaded'});
 await first.waitForTimeout(100);
 check(!(await first.locator('#intro').isVisible()),'Loader must not replay on same-session navigation');
 await first.close();await fresh.close();
 console.log('Mobile/desktop smoke tests passed:',checks);
} finally {await browser.close();server.close();}
