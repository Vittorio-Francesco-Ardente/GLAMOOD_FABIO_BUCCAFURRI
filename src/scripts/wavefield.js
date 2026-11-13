// <canvas> WebGL wave field in Glamood petrol (kit: shared/wavefield.js, adapted from Vittorio's menu shader).
// Renders only while visible (IntersectionObserver) and the tab is visible; DPR capped (1.85 desktop, 1.35 touch).
import { reduced, touch, loop } from './core.js';
const hex = (h) => { const n = parseInt(h.replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
export function mountWaves(el, o = {}) {
  const opt = { speed: 1, crest: 0.16, dark: '#0A4A50', mid: '#0F6870', light: '#12757E', ...o };
  const c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
  Object.assign(c.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' }); el.prepend(c);
  const gl = c.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { c.remove(); el.style.background = `${opt.mid} url(/img/brand/onde-piatte-petrolio-bianco.webp) center/cover`; return null; }
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, `precision mediump float;uniform vec2 R;uniform float T,K;uniform vec3 C0,C1,C2;
  float onda(vec2 uv,float y,float a,float f,float v,float s){return y+a*sin(uv.x*f+T*v)+a*.5*sin(uv.x*f*1.9-T*v*1.3+s);}
  void main(){vec2 uv=gl_FragCoord.xy/R;vec3 c=mix(C0,C1,smoothstep(0.,1.,uv.y));
    c=mix(c,C2,.35*smoothstep(.55,1.,uv.y+.12*sin(uv.x*2.+T*.15)));
    for(int i=0;i<4;i++){float fi=float(i);float y=onda(uv,.16+fi*.17,.03+.012*fi,2.6+fi*1.1,.3+fi*.1,fi*2.1);
      float d=uv.y-y;float body=smoothstep(.0,-.02,d)*(1.-smoothstep(-.02,-.3,d));float edge=exp(-abs(d)*110.);
      c=mix(c,C2,body*.22);c=mix(c,vec3(1.),edge*K);}
    float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);c+=(g-.5)*.025;gl_FragColor=vec4(c,1.);}`));
  gl.linkProgram(p); gl.useProgram(p); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const l = gl.getAttribLocation(p, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(p, n);
  gl.uniform3fv(u('C0'), hex(opt.dark)); gl.uniform3fv(u('C1'), hex(opt.mid)); gl.uniform3fv(u('C2'), hex(opt.light)); gl.uniform1f(u('K'), opt.crest);
  // soft gradients: half resolution (the browser upscales smoothly) and 30 fps are invisible, and 4-8x cheaper
  let lastT = 0, lastDraw = -1, cw = c.clientWidth, ch = c.clientHeight;
  const draw = (t, force) => {
    if (!force && t - lastDraw < 1 / 30) return; lastDraw = t; lastT = t;
    const dpr = .5;
    const w = Math.max(1, (cw * dpr) | 0), h = Math.max(1, (ch * dpr) | 0);
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    gl.viewport(0, 0, w, h); gl.uniform2f(u('R'), w, h); gl.uniform1f(u('T'), t * opt.speed + 3); gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
  draw(0, true); new ResizeObserver(() => { cw = c.clientWidth; ch = c.clientHeight; draw(lastT, true); }).observe(c);
  if (!reduced) c.loopCtl = loop(el, draw, opt.gate);
  return c;
}
