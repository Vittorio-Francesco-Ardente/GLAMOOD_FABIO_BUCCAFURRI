// usage: node qa.mjs out-dir [pages...]
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; const { chromium } = createRequire(import.meta.url)(execSync('npm root -g').toString().trim()+'/playwright');
const out=process.argv[2]; const pages=process.argv.slice(3).length?process.argv.slice(3):['/','/salone','/tagli','/listino','/prodotti','/dove','/storia'];
const VP={desk:[1440,900],tab:[820,1180],mob:[390,844]};
import fs from 'node:fs'; fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch(); const report=[];
for(const [vn,[w,h]] of Object.entries(VP)){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:vn==='mob',hasTouch:vn!=='desk'});
  const pg=await ctx.newPage(); pg.on('pageerror',e=>report.push(`[${vn}] JS ERROR ${e.message}`));
  for(const p of pages){
    await pg.goto('http://localhost:4321'+p,{waitUntil:'networkidle'}).catch(()=>{});
    await pg.waitForTimeout(1500);
    const H=await pg.evaluate(()=>document.documentElement.scrollHeight);
    let i=0;
    for(let y=0;y<H && i<40;y+=h*0.9,i++){
      await pg.evaluate(y=>window.scrollTo(0,y),y); await pg.waitForTimeout(700);
      await pg.screenshot({path:`${out}/${vn}${p.replace(/\//g,'_')||'_home'}-${String(i).padStart(2,'0')}.jpg`,quality:60,type:'jpeg'});
    }
    const iss=await pg.evaluate(()=>{const o=[];const vw=document.documentElement.clientWidth;
      if(document.documentElement.scrollWidth>vw+1)o.push('OVERFLOW-X '+document.documentElement.scrollWidth);
      document.querySelectorAll('img').forEach(im=>{const r=im.getBoundingClientRect();if(!r.width||!im.complete)return;const cs=getComputedStyle(im);if(cs.objectFit==='cover')return;
        if(cs.visibility==='hidden'||+cs.opacity===0)return;
        let a=im.parentElement,clip=null;while(a&&a!==document.body){const s=getComputedStyle(a);if(s.overflow!=='visible'||s.clipPath!=='none'){clip=a.getBoundingClientRect();break;}a=a.parentElement;}
        const lim=clip||{left:0,right:vw};const cut=[];if(r.left<lim.left-2)cut.push('L');if(r.right>lim.right+2)cut.push('R');
        if(clip){if(r.top<clip.top-2)cut.push('T');if(r.bottom>clip.bottom+2)cut.push('B');}
        if(cut.length)o.push('CUT '+cut.join('')+' '+(im.currentSrc||im.src).split('/img/')[1]+' '+Math.round(r.width)+'x'+Math.round(r.height));});
      return o;});
    report.push(...[...new Set(iss)].map(s=>`[${vn}] ${p} ${s}`));
  }
  await ctx.close();
}
await b.close(); fs.writeFileSync(out+'/report.txt',report.join('\n')); console.log(report.join('\n'));
