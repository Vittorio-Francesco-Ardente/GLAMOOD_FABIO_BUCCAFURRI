import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import assert from 'node:assert/strict';
const req=createRequire(import.meta.url);let pw;try{pw=req('playwright')}catch{pw=req(execSync('npm root -g').toString().trim()+'/playwright')}
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2'};
const prefix='/GLAMOOD_FABIO_BUCCAFURRI';
const server=createServer(async(req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://x').pathname).replace(prefix,'');if(!p||p.endsWith('/'))p+='index.html';else if(!extname(p))p+='.html';try{const data=await readFile(join('dist',p));res.writeHead(200,{'content-type':types[extname(p)]||'application/octet-stream'});res.end(data)}catch{res.writeHead(404);res.end('not found')}}).listen(4329,'127.0.0.1');
await mkdir('qa/product-experience',{recursive:true});
const browser=await pw.chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
const report=[];let failure;
try {
 const initial=await browser.newPage({viewport:{width:390,height:844}});
 await initial.clock.install({time:new Date('2026-11-13T10:00:00Z')});
 await initial.clock.pauseAt(new Date('2026-11-13T10:00:01Z'));
 await initial.goto(`http://127.0.0.1:4329${prefix}/`,{waitUntil:'domcontentloaded'});
 assert.equal(await initial.locator('#intro .ld-letter').count(),7,'entry spells GLAMOOD');
 assert.equal(await initial.locator('#intro .loader-emblem').count(),0,'no spinner ring');
 await initial.screenshot({path:'qa/product-experience/entry-loader.png'});
 await initial.clock.runFor(2000);
 assert.equal(await initial.locator('#intro').count(),0,'entry loader clears');
 await initial.close();
 for(const width of [390,768,1440]){
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:width<1024?3:2,hasTouch:width<768,isMobile:width<768});
 await context.addInitScript(()=>sessionStorage.setItem('glamood-intro','1'));
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=`http://127.0.0.1:4329${prefix}`;
 const capture=async(name)=>page.screenshot({path:`qa/product-experience/${name}-${width}.png`,fullPage:false});
 const bounds=async()=>page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&i.currentSrc&&!i.naturalWidth).map(i=>i.currentSrc)}));
 await page.goto(base+'/prodotti',{waitUntil:'networkidle'});await page.waitForTimeout(600);
 assert(await page.locator('.p3-skip').isVisible(),'skip is visible');
 assert(await page.locator('.testa').isVisible(),'one header on every page, products included');
 assert.equal(await page.locator('.barra').evaluate(e=>getComputedStyle(e).opacity),'0','dock hidden in intro');
 await capture('intro');
 if(width>=1024){await page.locator('.p3-txt.on .p3-more').click();await page.locator('#p3s').waitFor({state:'visible'});await capture('sheet');await page.locator('.p3s-x').click();await page.locator('#p3s').waitFor({state:'hidden'});}
 await page.locator('.p3-skip').click();await page.waitForTimeout(700);
 assert.equal(await page.evaluate(()=>document.activeElement?.id),'ct-t','skip focuses catalog');
 assert.equal(await page.locator('.barra').evaluate(e=>getComputedStyle(e).opacity),'1','dock restored in catalog');
 await capture('catalog');
 for(const slug of ['cera-opaca','crema-styling','balsamo-barba','olio-barba','crema-da-barba','shampoo','spray-al-sale','dopobarba']){
 await page.goto(base+'/prodotti/'+slug,{waitUntil:'networkidle'});
 const b=await bounds();assert(b.scroll<=b.width+1,`${slug} overflow ${b.scroll}/${b.width}`);assert.equal(b.broken.length,0,`${slug} missing images ${b.broken}`);
 assert.equal(await page.locator('.site-header').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)','header lies on the page');
 assert.equal(await page.locator('.product-summary').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)','white information card');
 if(slug==='cera-opaca'){
 await capture('detail');
 await page.getByRole('button',{name:'Etichetta',exact:true}).click();
 await page.locator('.product-main-image').click();assert(await page.locator('.product-lightbox').isVisible());await capture('label');
 await page.keyboard.press('Escape');assert.equal(await page.locator('.product-lightbox').isVisible(),false);
 await page.locator('summary',{hasText:'Ingredienti indicati'}).click();assert(await page.locator('.product-small').isVisible());
 await page.locator('.product-routine').scrollIntoViewIfNeeded();await capture('routine');
 await page.locator('.product-related').scrollIntoViewIfNeeded();await capture('related');
 }
 report.push({width,path:slug,...b});
 }
 await page.goto(base+'/dove',{waitUntil:'networkidle'});await page.locator('.contact-action').scrollIntoViewIfNeeded();await page.waitForTimeout(500);await capture('contact');
 const overlap=await page.evaluate(()=>{const a=document.querySelector('#pg-telefono').getBoundingClientRect(),b=document.querySelector('.contact-action .btns').getBoundingClientRect();return a.right>b.left+1&&a.left<b.right&&a.bottom>b.top&&a.top<b.bottom});assert.equal(overlap,false,'mascot does not overlap booking actions');
 await page.goto(base+'/404.html',{waitUntil:'networkidle'});await capture('404');
 await page.goto(base+'/',{waitUntil:'networkidle'});await capture('home');
 if(width===390){
 assert.equal(await page.locator('.testa').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)','no separate header panel');
 await page.locator('#burger').click();assert.equal(await page.locator('#burger').getAttribute('aria-expanded'),'true');
 await page.locator('#menu-close').click();assert.equal(await page.locator('#burger').getAttribute('aria-expanded'),'false');
 }
 assert.equal(await page.locator('#pt-cover .pt-g').count(),1);
 assert.equal(await page.locator('#pt-cover .loader-emblem').count(),0);
 assert.equal(await page.locator('#pt-cover .pt-word, #pt-cover .pt-run').count(),0);

 await page.locator('.testa .links a[href$="/prodotti"]').isVisible().then(async visible=>{if(visible){await page.locator('.testa .links a[href$="/prodotti"]').click();await page.waitForTimeout(120);assert(await page.locator('#pt-cover').evaluate(e=>e.classList.contains('in')),'transition starts');await capture('transition');await page.waitForURL('**/prodotti');await page.waitForTimeout(650);assert.equal(await page.locator('#pt-cover').evaluate(e=>e.classList.contains('in')||document.documentElement.classList.contains('pt-arrive')),false,'arrival clears');await page.goBack();await page.waitForTimeout(650);assert.equal(await page.locator('#pt-cover').evaluate(e=>e.classList.contains('in')),false,'back restores page');}});
 assert.deepEqual(errors,[],`JS errors at ${width}`);await context.close();
 }
} catch(e){failure=e;console.error(e)}finally{await writeFile('qa/product-experience/report.json',JSON.stringify({report,error:failure?.message},null,2));await browser.close();server.close();}
if(failure)process.exitCode=1;else console.log('Product experience: desktop, tablet, phone, gallery, modal, navigation and assets passed.');
