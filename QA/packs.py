from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageChops
import numpy as np, math
SRC='/home/claude/site/assets/web/v2/prodotti-3d/altri-formati/'
FA='/home/claude/gk/asset-gen/etichette/archivo-latin-900-normal.ttf'; FI='/home/claude/gk/asset-gen/etichette/instrument-sans-latin-600-normal.ttf'
G=Image.open('/home/claude/site/assets/web/brand/G-rasoio-crema-trasparente.webp').convert('RGBA')
Gp=Image.open('/home/claude/site/assets/web/brand/G-rasoio-petrolio-trasparente.webp').convert('RGBA')
def text(d,img,xy,s,font,fill,stretch=1.0,anchor='mm'):
    f=font; bb=d.textbbox((0,0),s,font=f); w,h=bb[2]-bb[0],bb[3]-bb[1]
    t=Image.new('RGBA',(w+20,h+20),(0,0,0,0)); ImageDraw.Draw(t).text((10-bb[0],10-bb[1]),s,font=f,fill=fill)
    if stretch!=1: t=t.resize((int(t.width*stretch),t.height),Image.LANCZOS)
    x,y=xy; img.alpha_composite(t,(int(x-t.width/2),int(y-t.height/2)))
# spec: file, body x0,x1, label top,bottom (px in 2048), ink, mode('cyl'|'flat'), lines, gmono
P={
 'crema-barba':dict(x=(640,1408),y=(560,1500),ink=(15,104,112,255),g=Gp,cyl=True,name=['CREMA','DA BARBA'],sub='rasatura morbida',vol='150 ml'),
 'dopobarba':dict(x=(500,1545),y=(820,1660),ink=(244,239,232,255),g=G,cyl=False,name=['DOPO','BARBA'],sub='al bergamotto',vol='100 ml',panel=(244,239,232,235),pink=(15,104,112,255)),
 'olio-barba':dict(x=(728,1320),y=(1060,1860),ink=(244,239,232,255),g=G,cyl=True,name=['OLIO','BARBA'],sub="all'argan",vol='30 ml'),
 'shampoo':dict(x=(668,1405),y=(900,1760),ink=(15,104,112,255),g=Gp,cyl=True,name=['SHAMPOO'],sub='aloe e menta',vol='250 ml'),
 'spray-sale':dict(x=(770,1288),y=(900,1800),ink=(244,239,232,255),g=G,cyl=True,name=['SPRAY','AL SALE'],sub='effetto mare',vol='200 ml'),
 'pomata-latta':dict(x=(260,1790),y=(905,1300),ink=(184,147,90,255),g=None,cyl=True,name=['POMATA CLASSICA'],sub='',vol='100 ml',oneline=True),
}
for k,s in P.items():
    base=Image.open(SRC+k+'-fronte.webp').convert('RGBA'); W,H=base.size
    x0,x1=s['x']; y0,y1=s['y']; lw,lh=x1-x0,y1-y0
    L=Image.new('RGBA',(lw,lh),(0,0,0,0)); d=ImageDraw.Draw(L); ink=s['ink']
    if s.get('panel'):
        d.rounded_rectangle([lw*.1,lh*.04,lw*.9,lh*.96],radius=int(lw*.04),fill=s['panel']); ink=s['pink']
        d.rounded_rectangle([lw*.13,lh*.07,lw*.87,lh*.93],radius=int(lw*.03),outline=(184,147,90,255),width=6)
    cx=lw/2
    if s.get('oneline'):
        text(d,L,(cx,lh*.3),'GLAMOOD',ImageFont.truetype(FA,int(lh*.34)),ink,1.25)
        text(d,L,(cx,lh*.68),'POMATA CLASSICA · 100 ML',ImageFont.truetype(FI,int(lh*.12)),ink)
    else:
        fs=int(lw*(.105 if lw<700 else .085)); 
        if s.get('panel'): fs=int(lw*.075)
        y=lh*.12
        if s['g'] is not None:
            g=(s['g'] if not s.get('panel') else Gp).copy(); gs=int(lw*.2); g.thumbnail((gs,gs)); L.alpha_composite(g,(int(cx-g.width/2),int(y)));y+=g.height+lh*.04
        text(d,L,(cx,y+fs*.5),'GLAMOOD',ImageFont.truetype(FA,fs),ink,1.22); y+=fs*1.25
        d.line([cx-lw*.18,y,cx+lw*.18,y],fill=(184,147,90,255),width=max(3,int(lw*.006))); y+=lh*.05
        nf=ImageFont.truetype(FA,int(fs*1.05))
        for line in s['name']:
            text(d,L,(cx,y+fs*.55),line,nf,ink,1.0); y+=fs*1.12
        y+=lh*.03
        text(d,L,(cx,y+fs*.2),s['sub'],ImageFont.truetype(FI,int(fs*.5)),ink); y+=fs*.75
        y+=fs*.25; text(d,L,(cx,y+fs*.4),s['vol'].upper(),ImageFont.truetype(FI,int(fs*.42)),ink)
    # cylindrical warp
    if s['cyl']:
        A=np.array(L); out=np.zeros_like(A); r=lw/2
        for xo in range(lw):
            u=(xo+.5-r)/r; th=math.asin(max(-1,min(1,u)))  # screen x -> angle
            src=int((th/(math.pi/2)*0.5+0.5)*(lw-1)*1.0)
            # map: label spans +-~70deg
            src=int(((th/ (math.radians(72)))*0.5+0.5)*(lw-1))
            if 0<=src<lw: out[:,xo]=A[:,src]
        L=Image.fromarray(out)
    # shade by pack luminance: keep the pack's highlights/shadows on top of the print
    crop=base.crop((x0,y0,x1,y1)); lum=np.array(crop.convert('L')).astype(float)
    blur=np.array(crop.convert('L').filter(ImageFilter.GaussianBlur(40))).astype(float)
    hi=np.clip((lum-blur)*2.2,0,255)
    A=np.array(L).astype(float); shade=np.clip(blur/ (blur.mean()+1e-3),.6,1.15)[...,None]
    A[...,:3]=np.clip(A[...,:3]*shade+hi[...,None]*.55,0,255)
    A[...,3]*=np.array(crop.getchannel('A'))/255*.96
    L=Image.fromarray(A.astype(np.uint8))
    out=base.copy(); out.alpha_composite(L,(x0,y0)); out.save(f'{k}-etichettato.png')
print('ok')
