import { TOWERS, BOSSES, CORE } from '../config.js';
import { S } from '../state.js';

function glow(ctx, x, y, r, color, alpha = .25) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2,'0')}`); g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function polygon(ctx, points, fill, stroke = '#10161a', width = 2) {
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke();
}
function drawBoss(ctx, e) {
  const pulse = 1 + Math.sin(e.pulse * 3) * .035, r = e.radius * pulse;
  ctx.save(); ctx.translate(e.x, e.y); glow(ctx, 0, 0, r * 2, e.color, .24);
  if (e.bossKind === 'colossus') {
    ctx.rotate(Math.sin(e.anim * .7) * .05);
    polygon(ctx, [[-r*.76,-r*.48],[-r*.34,-r*.88],[r*.4,-r*.85],[r*.78,-r*.45],[r*.86,r*.34],[r*.36,r*.88],[-r*.42,r*.83],[-r*.86,r*.28]], '#343b3c','#e28e69',4);
    polygon(ctx,[[-r*.83,-r*.34],[-r*1.12,-r*.55],[-r*1.2,-r*.2],[-r*.85,r*.02]],'#626762','#c58263',3);
    polygon(ctx,[[r*.83,-r*.34],[r*1.12,-r*.55],[r*1.2,-r*.2],[r*.85,r*.02]],'#626762','#c58263',3);
    for (let i=-1;i<=1;i++) { polygon(ctx,[[i*r*.38-r*.2,-r*.63],[i*r*.38+r*.16,-r*.67],[i*r*.38+r*.22,r*.55],[i*r*.38-r*.2,r*.62]],'#515957','#202829',2); }
    ctx.fillStyle = '#ffb16e'; ctx.fillRect(-r*.48,-r*.24,r*.96,r*.14); ctx.fillStyle = '#fff0ca'; ctx.fillRect(-r*.33,-r*.2,r*.66,r*.045);
    ctx.beginPath(); ctx.arc(0,r*.13,r*.22,0,Math.PI*2); ctx.fillStyle='#ed7358';ctx.fill();ctx.strokeStyle='#ffbd7d';ctx.lineWidth=3;ctx.stroke();
    for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);ctx.fillStyle='#d77b55';ctx.fillRect(-4,-r*.94,8,16);ctx.restore();}
  } else if (e.bossKind === 'cartographer') {
    ctx.rotate(e.anim * .12);
    for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);polygon(ctx,[[0,-r*.25],[-r*.14,-r*.92],[0,-r*1.17],[r*.14,-r*.92]],i%2?'#624a82':'#a985cf','#d3b6ed',2);ctx.restore();}
    polygon(ctx,[[0,-r*.72],[r*.62,-r*.28],[r*.48,r*.47],[0,r*.73],[-r*.48,r*.47],[-r*.62,-r*.28]],'#30253f','#d7b4ee',4);
    ctx.beginPath();ctx.arc(0,0,r*.28,0,Math.PI*2);ctx.fillStyle='#d0a4f7';ctx.fill();ctx.strokeStyle='#fff0ff';ctx.lineWidth=4;ctx.stroke();
    ctx.beginPath();ctx.moveTo(-r*.95,0);ctx.lineTo(r*.95,0);ctx.moveTo(0,-r*.95);ctx.lineTo(0,r*.95);ctx.strokeStyle='rgba(245,221,255,.45)';ctx.lineWidth=2;ctx.stroke();
    ctx.font=`bold ${r*.22}px monospace`;ctx.fillStyle='#f4ddff';ctx.textAlign='center';ctx.fillText('N',0,-r*.78);
  } else if (e.bossKind === 'matriarch') {
    ctx.rotate(Math.sin(e.anim*.35)*.08);
    for(let side of [-1,1]) {
      ctx.save();ctx.scale(side,1);
      polygon(ctx,[[r*.08,-r*.1],[r*.53,-r*.78],[r*.44,-r*.16],[r*.92,-r*.45],[r*.61,r*.16],[r*.99,r*.62],[r*.32,r*.43],[r*.06,r*.78]],'#203d4c','#90d4ea',3);
      for(let n=0;n<3;n++){ctx.beginPath();ctx.moveTo(r*.16+n*9,r*.05);ctx.quadraticCurveTo(r*.85+n*5,r*.1,r*.42+n*10,r*.76);ctx.strokeStyle='rgba(145,222,242,.45)';ctx.lineWidth=4;ctx.stroke();}
      ctx.restore();
    }
    polygon(ctx,[[0,-r*.9],[r*.55,-r*.4],[r*.7,r*.15],[r*.43,r*.78],[0,r*.94],[-r*.43,r*.78],[-r*.7,r*.15],[-r*.55,-r*.4]],'#18262f','#8bd6e6',4);
    ctx.beginPath();ctx.ellipse(0,0,r*.3,r*.45,0,0,Math.PI*2);ctx.fillStyle='#a8e9ef';ctx.fill();ctx.strokeStyle='#e0ffff';ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,r*.14,0,Math.PI*2);ctx.fillStyle='#163f5b';ctx.fill();ctx.beginPath();ctx.arc(0,0,r*.055,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
  } else if (e.bossKind === 'stormcaller') {
    ctx.rotate(e.anim * .08);
    polygon(ctx,[[-r*.7,-r*.48],[-r*.25,-r*.88],[r*.38,-r*.7],[r*.82,-r*.25],[r*.68,r*.58],[r*.18,r*.88],[-r*.55,r*.65],[-r*.88,r*.05]],'#19495a','#79e8ff',4);
    ctx.beginPath();ctx.moveTo(-r*.55,-r*.1);ctx.lineTo(r*.1,-r*.38);ctx.lineTo(r*.42,-r*.05);ctx.lineTo(r*.76,r*.12);ctx.strokeStyle='#baf7ff';ctx.lineWidth=5;ctx.stroke();
    ctx.beginPath();ctx.arc(0,r*.12,r*.26,0,Math.PI*2);ctx.fillStyle='#73e5ff';ctx.fill();ctx.strokeStyle='#e3fcff';ctx.lineWidth=3;ctx.stroke();
  } else if (e.bossKind === 'demolisher') {
    ctx.rotate(Math.sin(e.anim*.5)*.04);
    polygon(ctx,[[-r*.88,-r*.42],[-r*.38,-r*.82],[r*.52,-r*.72],[r*.92,-r*.22],[r*.78,r*.62],[r*.22,r*.9],[-r*.62,r*.72],[-r*.92,r*.18]],'#633d31','#f09a58',5);
    ctx.fillStyle='#f6aa67';ctx.fillRect(-r*.58,-r*.32,r*1.16,r*.18);
    ctx.beginPath();ctx.moveTo(-r*.62,r*.08);ctx.lineTo(r*.62,r*.08);ctx.strokeStyle='#2b2524';ctx.lineWidth=r*.26;ctx.stroke();
  } else {
    ctx.rotate(Math.sin(e.anim*.9)*.1);
    polygon(ctx,[[-r*.72,-r*.6],[0,-r*.92],[r*.72,-r*.6],[r*.88,r*.24],[r*.28,r*.78],[-r*.28,r*.78],[-r*.88,r*.24]],'#542432','#ed697f',4);
    ctx.beginPath();ctx.arc(0,0,r*.34,0,Math.PI*2);ctx.fillStyle='#ed697f';ctx.fill();ctx.strokeStyle='#ffd3da';ctx.lineWidth=4;ctx.stroke();
    ctx.beginPath();ctx.moveTo(-r*.7,0);ctx.quadraticCurveTo(0,r*.5,r*.7,0);ctx.strokeStyle='#ffc0c9';ctx.lineWidth=3;ctx.stroke();
  }
  ctx.restore();
  const barW = r*2.4, bx=e.x-barW/2, by=e.y-r-20;
  ctx.fillStyle='rgba(3,7,10,.8)';ctx.fillRect(bx-2,by-2,barW+4,9);ctx.fillStyle=e.color;ctx.fillRect(bx,by,barW*Math.max(0,e.hp/e.maxHp),5);
  ctx.fillStyle='#f5e5d3';ctx.font='700 11px monospace';ctx.textAlign='center';ctx.fillText(BOSSES[e.bossKind]?.name||'JEFE',e.x,e.y-r-27);
}

export function drawEnemy(ctx,e) {
  if(e.boss){drawBoss(ctx,e);return;}
  const r=e.radius, c=e.color, breathe=1+Math.sin(e.anim*4.2+e.pulse)*.035;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.sin(e.anim*2)*.08);ctx.scale(breathe,breathe);
  glow(ctx,0,0,r*(2.25+Math.sin(e.anim*3)*.18),c,.14+Math.sin(e.anim*5)*.025);
  const body=ctx.createRadialGradient(-r*.3,-r*.4,2,0,0,r*1.3);body.addColorStop(0,'#f0d5ae');body.addColorStop(.3,c);body.addColorStop(1,'#302e31');
  if(e.type==='tank'){
    polygon(ctx,[[-r*.9,-r*.35],[-r*.5,-r*.8],[r*.65,-r*.72],[r*.95,-r*.2],[r*.85,r*.56],[r*.2,r*.88],[-r*.75,r*.6]],body,'#9fa9a4',3);
    ctx.fillStyle='#20282a';ctx.fillRect(-r*.7,-r*.1,r*1.4,r*.36);for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#bdc5b8':'#697574';ctx.fillRect(-r*.62+i*r*.25,-r*.08,r*.12,r*.32);}
    ctx.fillStyle='#ff9b69';ctx.fillRect(-r*.24,-r*.46,r*.48,r*.12);
  } else if(e.type==='runner'){
    polygon(ctx,[[-r*1.12,0],[-r*.28,-r*.56],[r*.78,-r*.34],[r,0],[r*.62,r*.3],[-r*.2,r*.65]],body,'#f0ae79',2);
    ctx.beginPath();ctx.moveTo(-r*.25,0);ctx.lineTo(r*.72,0);ctx.strokeStyle='#ffda9f';ctx.lineWidth=3;ctx.stroke();
  } else if(e.type==='flanker'){
    polygon(ctx,[[-r,-r*.36],[-r*.2,-r*.8],[r*.9,-r*.45],[r*.68,0],[r,r*.5],[r*.02,r*.75],[-r*.65,r*.42]],body,'#f49b9b',3);
    for(let side of [-1,1]){ctx.beginPath();ctx.moveTo(side*r*.1,-r*.16);ctx.lineTo(side*r*.56,-r*.44);ctx.lineTo(side*r*.34,r*.2);ctx.strokeStyle='#ffd1bd';ctx.lineWidth=3;ctx.stroke();}
    ctx.beginPath();ctx.moveTo(-r*.4,r*.28);ctx.lineTo(r*.48,-r*.24);ctx.strokeStyle='#742f42';ctx.lineWidth=3;ctx.stroke();
  } else if(e.type==='saboteur'){
    polygon(ctx,[[-r*.72,-r*.5],[0,-r],[r*.72,-r*.5],[r*.72,r*.48],[0,r],[-r*.72,r*.48]],body,'#e6df7d',3);
    ctx.beginPath();ctx.moveTo(-r*.35,-r*.18);ctx.lineTo(r*.35,-r*.18);ctx.lineTo(0,r*.34);ctx.closePath();ctx.fillStyle='#3d3b24';ctx.fill();
    ctx.beginPath();ctx.moveTo(0,-r*.84);ctx.lineTo(0,-r*1.25);ctx.moveTo(-r*.24,-r*1.2);ctx.lineTo(r*.24,-r*1.2);ctx.strokeStyle='#fff2a1';ctx.lineWidth=3;ctx.stroke();
  } else if(e.type==='raider'){
    polygon(ctx,[[-r*.95,-r*.15],[-r*.48,-r*.8],[r*.4,-r*.72],[r*.95,-r*.05],[r*.52,r*.72],[-r*.45,r*.78]],body,'#f4c08c',3);
    polygon(ctx,[[-r*.37,-r*.28],[r*.28,-r*.34],[r*.48,r*.12],[0,r*.5],[-r*.42,r*.12]],'#55403a','#ffc48a',2);
    ctx.beginPath();ctx.arc(0,0,r*.14,0,Math.PI*2);ctx.fillStyle='#ffebbd';ctx.fill();
  } else if(e.type==='split'){
    polygon(ctx,[[0,-r],[r*.85,-r*.24],[r*.58,r*.75],[-r*.58,r*.75],[-r*.85,-r*.24]],body,'#f0c0cb',3);
    ctx.beginPath();ctx.moveTo(0,-r*.6);ctx.lineTo(0,r*.6);ctx.moveTo(-r*.5,-r*.1);ctx.lineTo(r*.5,r*.2);ctx.strokeStyle='#3c2637';ctx.lineWidth=3;ctx.stroke();
  } else if(e.type==='ranged'){
    ctx.beginPath();ctx.ellipse(0,0,r*.8,r,0,0,Math.PI*2);ctx.fillStyle=body;ctx.fill();ctx.strokeStyle='#edb4ed';ctx.lineWidth=3;ctx.stroke();
    for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*r*.35,r*.45);ctx.lineTo(i*r*.58,r*1.12);ctx.strokeStyle='#d58ad4';ctx.lineWidth=4;ctx.stroke();}
    ctx.beginPath();ctx.arc(0,-r*.16,r*.2,0,Math.PI*2);ctx.fillStyle='#ffd9f9';ctx.fill();
  } else if(e.type==='gunner'){
    ctx.beginPath();ctx.moveTo(-r*.82,-r*.72);ctx.lineTo(r*.72,-r*.72);ctx.lineTo(r*.95,r*.55);ctx.lineTo(-r*.75,r*.72);ctx.closePath();ctx.fillStyle=body;ctx.fill();ctx.strokeStyle='#ff9baa';ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.moveTo(r*.1,-r*.2);ctx.lineTo(r*1.45,-r*.05);ctx.strokeStyle='#ffb1ba';ctx.lineWidth=r*.22;ctx.stroke();
    ctx.fillStyle='#ffe0e4';ctx.fillRect(r*.92,-r*.13,r*.55,r*.26);
  } else if(e.type==='burst'){
    polygon(ctx,[[-r*.8,-r*.5],[r*.2,-r*.9],[r*.85,-r*.25],[r*.68,r*.65],[r*.05,r*.9],[-r*.72,r*.5]],body,'#ffc18c',3);
    ctx.beginPath();ctx.moveTo(r*.15,-r*.35);ctx.lineTo(r*1.35,0);ctx.moveTo(r*.15,r*.35);ctx.lineTo(r*1.35,0);ctx.strokeStyle='#ffd19f';ctx.lineWidth=4;ctx.stroke();
  } else if(e.type==='prism'){
    for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);polygon(ctx,[[0,-r*.25],[r*.18,-r],[r*.38,-r*.12],[r*.12,r*.22]],i%2?'#83eee4':'#3da9a4','#bafff6',2);ctx.restore();}
    ctx.beginPath();ctx.arc(0,0,r*.32,0,Math.PI*2);ctx.fillStyle='#b8fff4';ctx.fill();ctx.strokeStyle='#eafffb';ctx.lineWidth=3;ctx.stroke();
  } else if(e.type==='nova'){
    ctx.beginPath();ctx.arc(0,0,r*.78,0,Math.PI*2);ctx.fillStyle=body;ctx.fill();ctx.strokeStyle='#d3b6ff';ctx.lineWidth=3;ctx.stroke();
    ctx.save();ctx.rotate(e.anim*1.8);
    for(let i=0;i<5;i++){ctx.save();ctx.rotate(i*Math.PI*2/5);ctx.beginPath();ctx.moveTo(0,-r*.3);ctx.lineTo(r*.12,-r*.95);ctx.lineTo(r*.28,-r*.32);ctx.closePath();ctx.fillStyle='#c7a3ff';ctx.fill();ctx.restore();}
    ctx.restore();
  } else if(e.type==='healer'){
    ctx.beginPath();ctx.arc(0,0,r*.78,0,Math.PI*2);ctx.fillStyle=body;ctx.fill();ctx.strokeStyle='#b7f0a4';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#eaffcf';ctx.fillRect(-r*.12,-r*.5,r*.24,r);ctx.fillRect(-r*.5,-r*.12,r,r*.24);
  } else if(e.type==='shield'){
    polygon(ctx,[[0,-r],[r*.82,-r*.48],[r*.9,r*.35],[0,r],[-r*.9,r*.35],[-r*.82,-r*.48]],body,'#b9d9f8',3);
    ctx.beginPath();ctx.arc(0,0,r*.7,0,Math.PI*2);ctx.strokeStyle='rgba(161,216,255,.8)';ctx.lineWidth=3;ctx.stroke();
  } else {
    for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-r*.25,-r*1.1);ctx.lineTo(r*.25,-r*1.1);ctx.closePath();ctx.fillStyle=i%2?'#74583e':'#d2a16a';ctx.fill();ctx.restore();}
    ctx.beginPath();ctx.arc(0,0,r*.68,0,Math.PI*2);ctx.fillStyle=body;ctx.fill();ctx.strokeStyle='#ebc693';ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,0,r*.38,r*.2,.15,0,Math.PI*2);ctx.fillStyle='#251d1b';ctx.fill();ctx.fillStyle='#ffcc7c';ctx.fillRect(-r*.23,-2,r*.46,4);
  }
  ctx.beginPath();ctx.arc(0,0,r+4+Math.sin(e.anim*3+e.pulse)*2,.15+e.anim*.16,Math.PI*1.7+e.anim*.16);ctx.strokeStyle=`${c}88`;ctx.lineWidth=1.5;ctx.setLineDash([3,8]);ctx.stroke();ctx.setLineDash([]);
  if(e.type==='ranged'||e.type==='gunner'||e.type==='burst'||e.type==='prism'||e.type==='nova'||e.type==='healer'||e.type==='saboteur'){
    for(let i=0;i<3;i++){const a=e.anim*(i%2?-.8:1)+i*Math.PI*2/3,px=Math.cos(a)*(r+7),py=Math.sin(a)*(r+7);ctx.beginPath();ctx.arc(px,py,1.5+(i%2),0,Math.PI*2);ctx.fillStyle=i%2?'#fff1bc':'#dfffee';ctx.fill();}
  }
  if(e.slow>0){ctx.beginPath();ctx.arc(0,0,r+5,0,Math.PI*2);ctx.strokeStyle='#79e8f2';ctx.lineWidth=2;ctx.stroke();}
  if(e.expose>0){ctx.beginPath();ctx.arc(0,0,r+9,0,Math.PI*2);ctx.strokeStyle='#edc7ff';ctx.lineWidth=2;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);}
  if(e.hitFlash>0){ctx.globalAlpha=.4;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();}
  ctx.restore();
  if(e.hp<e.maxHp){ctx.fillStyle='#11191d';ctx.fillRect(e.x-r,e.y-r-9,r*2,4);ctx.fillStyle=e.boss?'#eeb2ff':'#e6b17c';ctx.fillRect(e.x-r,e.y-r-9,r*2*Math.max(0,e.hp/e.maxHp),4);}
}

export function drawTower(ctx,t) {
  const cfg=TOWERS[t.type],r=t.type==='mortar'?22:20;
  ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.angle||0);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(2,9,r*1.55,r*.9,0,0,Math.PI*2);ctx.fill();
  const pulse=Math.sin(t.anim*3.1)*.08, firing=t.fireFlash>0;
  glow(ctx,0,0,r*(2.35+pulse),cfg.color,firing ? .25 : .12);
  ctx.save();ctx.rotate(t.anim*.32);ctx.beginPath();ctx.ellipse(0,0,r*1.29,r*.48,0,0,Math.PI*2);ctx.strokeStyle=`${cfg.color}${firing?'aa':'56'}`;ctx.lineWidth=firing?2:1;ctx.setLineDash([2,7]);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  const g=ctx.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#9aa5a0');g.addColorStop(.42,'#4d5a5a');g.addColorStop(1,'#20292d');
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=t.hitFlash>0?'#fff':cfg.color;ctx.lineWidth=3;ctx.stroke();
  if(t.type==='ballista'){
    polygon(ctx,[[-r*.75,-4],[r*.76,-4],[r*1.12,0],[r*.76,4],[-r*.75,4]],'#303a3d','#dabd82',2);
    ctx.beginPath();ctx.moveTo(0,-r*.78);ctx.quadraticCurveTo(r*.7,0,0,r*.78);ctx.moveTo(0,-r*.7);ctx.lineTo(0,r*.7);ctx.strokeStyle='#dbca9c';ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.arc(r*.37,0,3+Math.sin(t.anim*8)*1.5,0,Math.PI*2);ctx.fillStyle=firing?'#fff2bf':'#d8c997';ctx.fill();
  } else if(t.type==='mortar'){
    ctx.beginPath();ctx.arc(0,0,r*.67,0,Math.PI*2);ctx.fillStyle='#222d30';ctx.fill();ctx.strokeStyle='#cf775a';ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(r*1.1,0);ctx.strokeStyle='#151d20';ctx.lineWidth=9;ctx.stroke();ctx.strokeStyle='#dc9879';ctx.lineWidth=3;ctx.stroke();
  } else if(t.type==='cryo'){
    ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/2,x=Math.cos(a)*r*.75,y=Math.sin(a)*r*.75;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fillStyle='#253f4a';ctx.fill();ctx.strokeStyle='#95edf0';ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,r*.28,0,Math.PI*2);ctx.fillStyle='#a8ffff';ctx.fill();
  } else if(t.type==='totem'){
    for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI/3);ctx.fillStyle='#715f91';ctx.fillRect(-4,-r*.85,8,r*1.7);ctx.restore();}
    ctx.beginPath();ctx.arc(0,0,r*.27,0,Math.PI*2);ctx.fillStyle='#e0baff';ctx.fill();
  } else if(t.type==='generator'){
    ctx.beginPath();ctx.arc(0,0,r*.78,0,Math.PI*2);ctx.fillStyle='#1f3934';ctx.fill();ctx.strokeStyle='#9ce8c2';ctx.lineWidth=3;ctx.stroke();
    for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI*2/3+t.anim*.3);ctx.fillStyle='#557a6c';ctx.fillRect(-3,-r*.85,6,r*1.7);ctx.fillStyle='#b9f5d5';ctx.fillRect(-6,-r*.88,12,5);ctx.restore();}
    ctx.fillStyle='#d4ffe8';ctx.font='bold 21px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('ϟ',0,1);
  } else if(t.type==='shieldwall'){
    ctx.save();
    ctx.rotate(Math.PI/2);
    ctx.beginPath();ctx.moveTo(-r*1.15,-r*.48);ctx.lineTo(r*1.15,-r*.48);ctx.lineTo(r*.92,r*.62);ctx.lineTo(-r*.92,r*.62);ctx.closePath();
    ctx.fillStyle='#263e4a';ctx.fill();ctx.strokeStyle='#9bd1f0';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='rgba(155,209,240,.28)';ctx.fillRect(-r*.82,-r*.34,r*1.64,r*.12);
    ctx.restore();
    if(t.shieldHits>0){for(let i=0;i<Math.min(5,t.shieldHits);i++){ctx.beginPath();ctx.arc(t.x-r*.15+i*7,t.y-r-8,2,0,Math.PI*2);ctx.fillStyle='#ffe083';ctx.fill();}}
  } else {
    ctx.beginPath();ctx.moveTo(-r*.55,r*.52);ctx.lineTo(-r*.35,-r*.55);ctx.lineTo(0,-r*.12);ctx.lineTo(r*.28,-r*.83);ctx.lineTo(r*.48,r*.55);ctx.closePath();ctx.fillStyle='#703c35';ctx.fill();ctx.strokeStyle='#ffa06e';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.arc(r*.1,-r*.12,5+Math.sin(t.anim*8)*2,0,Math.PI*2);ctx.fillStyle='#ffcc73';ctx.fill();
  }
  for(let i=0;i<t.level;i++){ctx.fillStyle='#e8dab5';ctx.fillRect(-7+i*7,-r-8,4,4);}
  if(t.evo){ctx.beginPath();ctx.arc(0,0,r+10,0,Math.PI*2);ctx.strokeStyle=t.evo.color;ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.stroke();ctx.setLineDash([]);}
  ctx.restore();
  if(t.disabled>0){ctx.beginPath();ctx.arc(t.x,t.y,r+8,0,Math.PI*2);ctx.strokeStyle='rgba(202,146,238,.85)';ctx.lineWidth=4;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);}
  if(t.hp<t.maxHp){ctx.fillStyle='#11191d';ctx.fillRect(t.x-r,t.y+r+5,r*2,4);ctx.fillStyle='#79cfaa';ctx.fillRect(t.x-r,t.y+r+5,r*2*Math.max(0,t.hp/t.maxHp),4);}
  if(S.selectedTower===t.id){ctx.beginPath();ctx.arc(t.x,t.y,r+14,0,Math.PI*2);ctx.strokeStyle='rgba(228,239,210,.8)';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);}
}

export function drawHero(ctx, h = S.hero, player = 1) {
  if (!h || h.hp <= 0) return;
  const t=S.lastTime/1000||0, bob=Math.sin(t*7+(player-1)*1.4)*1.6;
  ctx.save();ctx.beginPath();ctx.arc(h.x,h.y+bob,40,0,Math.PI*2);ctx.strokeStyle=h.color;ctx.lineWidth=2.5;ctx.globalAlpha=.55+Math.sin(t*4)*.2;ctx.setLineDash([7,6]);ctx.stroke();ctx.restore();
  ctx.save();ctx.translate(h.x,h.y+bob);ctx.rotate(h.aim);ctx.scale(1.9,1.9);
  glow(ctx,0,0,46+Math.sin(t*3)*3,h.color,.22);
  ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(2,13,21,11,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=h.type==='engineer'?'#273944':h.type==='ranger'?'#3c3b2c':'#26393a';ctx.beginPath();ctx.moveTo(-12,-11);ctx.lineTo(4,-15);ctx.lineTo(15,-9);ctx.lineTo(18,8);ctx.lineTo(6,14);ctx.lineTo(-12,9);ctx.closePath();ctx.fill();ctx.strokeStyle=h.color;ctx.lineWidth=3;ctx.stroke();
  if(h.type==='engineer'){ctx.fillStyle='#446270';ctx.fillRect(-15,-9,7,17);ctx.fillStyle='#9ee7ea';ctx.fillRect(-16,-5,5,4);ctx.beginPath();ctx.arc(-13,2,2+Math.sin(t*5)*.8,0,Math.PI*2);ctx.fillStyle='#e0ffff';ctx.fill();}
  else if(h.type==='ranger'){ctx.beginPath();ctx.moveTo(-4,-13);ctx.lineTo(8,-20);ctx.lineTo(18,-13);ctx.lineTo(5,-8);ctx.closePath();ctx.fillStyle='#6c6747';ctx.fill();ctx.strokeStyle=h.color;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(-16,-4);ctx.lineTo(-23,-9);ctx.moveTo(-16,5);ctx.lineTo(-23,10);ctx.strokeStyle='#d5c786';ctx.lineWidth=2;ctx.stroke();}
  else{ctx.fillStyle='#57736c';ctx.beginPath();ctx.moveTo(-4,-11);ctx.lineTo(7,-14);ctx.lineTo(12,-5);ctx.lineTo(1,-3);ctx.closePath();ctx.fill();ctx.strokeStyle='#aacabb';ctx.lineWidth=2;ctx.stroke();}
  ctx.beginPath();ctx.arc(1,-1,7,0,Math.PI*2);ctx.fillStyle='#15242a';ctx.fill();ctx.strokeStyle=h.color;ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(4,-4);ctx.lineTo(19,-3);ctx.lineTo(29,0);ctx.lineTo(19,4);ctx.lineTo(4,4);ctx.closePath();ctx.fillStyle='#cddbd3';ctx.fill();ctx.strokeStyle='#33474a';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle=h.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(25,0);ctx.stroke();ctx.restore();
  ctx.fillStyle='#e9f6ee';ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillText(player===2?'P2':'P1',h.x,h.y-58);
  if(player===2){ctx.fillStyle='#10181c';ctx.fillRect(h.x-7,h.y-29,14,12);ctx.fillStyle=h.color;ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('2',h.x,h.y-20);}
  if(S.fireMode==='manual') { const pointer=player===2?S.pointer2:S.pointer;const x=pointer.x+S.camera.x,y=pointer.y+S.camera.y;ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.strokeStyle=player===2?'rgba(239,183,111,.9)':'rgba(240,239,202,.85)';ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.moveTo(x-15,y);ctx.lineTo(x-5,y);ctx.moveTo(x+5,y);ctx.lineTo(x+15,y);ctx.moveTo(x,y-15);ctx.lineTo(x,y-5);ctx.moveTo(x,y+5);ctx.lineTo(x,y+15);ctx.stroke();}
}

export function drawCore(ctx) {
  const r=CORE.radius;
  glow(ctx,CORE.x,CORE.y,150,'#74e8c1',.32);
  ctx.save();ctx.translate(CORE.x,CORE.y);
  ctx.beginPath();ctx.arc(0,0,r+13,0,Math.PI*2);ctx.strokeStyle='rgba(132,238,202,.42)';ctx.lineWidth=2;ctx.setLineDash([5,6]);ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);polygon(ctx,[[-12,-r*.78],[12,-r*.78],[25,-r*.38],[0,-r*.2],[-25,-r*.38]],'#506765','#91dbbf',2);ctx.restore();}
  ctx.beginPath();ctx.arc(0,0,r*.54,0,Math.PI*2);ctx.fillStyle='#172729';ctx.fill();ctx.strokeStyle='#86e7c3';ctx.lineWidth=5;ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,r*.3,0,Math.PI*2);ctx.fillStyle='#83e5bd';ctx.fill();ctx.beginPath();ctx.arc(-7,-8,r*.13,0,Math.PI*2);ctx.fillStyle='#e6fff0';ctx.fill();ctx.restore();
}
