(function(){
const c=document.getElementById('bg-og-canvas');if(!c)return;
const ctx=c.getContext('2d');
let W,H,dpr;function resize(){dpr=devicePixelRatio||1;W=c.clientWidth;H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
resize();window.addEventListener('resize',()=>{resize();S=Math.max(Math.min(W,H)*0.35,200);});

let S=Math.max(Math.min(W,H)*0.35, 200);
if(S<50){setTimeout(()=>{resize();S=Math.max(Math.min(W,H)*0.35,200);},500);}
const reg=(label,rx,ry,rz,sz)=>({label,x:(rx+(.4*Math.random()-.2))*S,y:(ry+(.4*Math.random()-.2))*S,z:(rz+(.4*Math.random()-.2))*S,sz:sz||10,off:Math.random()*6.28});
const nodes=[
 {label:'Jake Davis',x:0,y:0,z:0,sz:14,off:0},
 // Central
 reg('AI',0,-.1,.1,12),reg('Machine Learning',.1,-.15,.15,11),reg('Deep Learning',-.1,-.1,.2,11),reg('Neural Nets',.15,0,.1,10),reg('Data Science',-.15,.05,.05,10),
 // Frontal (positive Z, upper)
 reg('JavaScript',.2,-.3,.6,11),reg('TypeScript',.35,-.25,.55,10),reg('React',.1,-.35,.7,11),reg('Node.js',.3,-.2,.65,10),reg('Web Dev',0,-.4,.6,11),reg('HTML/CSS',-.2,-.3,.55,10),reg('REST APIs',.15,-.15,.7,9),reg('Canvas API',-.15,-.25,.65,9),reg('3D Graphics',-.3,-.2,.5,9),
 // Parietal (upper, spread)
 reg('Python',-.3,-.6,.1,12),reg('NumPy',-.4,-.55,.05,9),reg('Selenium',-.25,-.65,.15,9),reg('Automation',-.15,-.5,-.05,10),reg('Docker',.3,-.55,.0,10),reg('Git',.15,-.6,.1,10),reg('Linux',.4,-.5,-.05,10),reg('AWS',.25,-.65,.05,10),reg('PostgreSQL',.05,-.55,-.1,10),
 // Temporal (sides)
 reg('Neuroscience',-.7,0,-.1,11),reg('Cognitive Science',-.65,.1,.05,10),reg('Neurobiology',-.6,-.1,-.15,10),reg('Memory',-.55,.15,0,10),reg('Learning',-.5,-.05,.1,10),
 reg('Photography',.65,.05,-.1,10),reg('Obsidian',.6,.15,.05,10),reg('Markdown',.55,-.05,.1,9),reg('MCP',.7,.1,0,9),reg('Claude AI',.6,-.1,.15,11),
 // Occipital (negative Z)
 reg('Research',0,.1,-.6,10),reg('BYU',.15,.2,-.55,10),reg('Vault Keeper',-.2,.15,-.65,9),reg('Crypto Bot',.25,.05,-.6,9),reg('Web Scraper',-.1,.0,-.7,9),reg('Portfolio',.05,.2,-.5,10),
 // Cerebellum (lower back)
];

// Generate links: connect nearby nodes + some random
const links=[];
const N=nodes.length;
const dists=[];
for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){
 const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,dz=nodes[i].z-nodes[j].z;
 dists.push({i,j,d:dx*dx+dy*dy+dz*dz});
}
dists.sort((a,b)=>a.d-b.d);
const linked=new Set();
// Each node gets ~3-4 closest connections
for(const{i,j}of dists){
 const ki=linked.has?[...linked].filter(k=>k.startsWith(i+',')||k.endsWith(','+i)).length:0;
 // simplified: just take top ~90 links
 if(links.length>=90)break;
 links.push([i,j]);
}

let rotY=0,rotX=0,autoRot=0.003,dragging=false,lx,ly;
c.addEventListener('mousedown',e=>{dragging=true;lx=e.clientX;ly=e.clientY;});
window.addEventListener('mouseup',()=>dragging=false);
window.addEventListener('mousemove',e=>{if(!dragging)return;rotY+=(e.clientX-lx)*0.005;rotX+=(e.clientY-ly)*0.005;lx=e.clientX;ly=e.clientY;});
c.addEventListener('touchstart',e=>{dragging=true;lx=e.touches[0].clientX;ly=e.touches[0].clientY;},{passive:true});
window.addEventListener('touchend',()=>dragging=false);
window.addEventListener('touchmove',e=>{if(!dragging)return;rotY+=(e.touches[0].clientX-lx)*0.005;rotX+=(e.touches[0].clientY-ly)*0.005;lx=e.touches[0].clientX;ly=e.touches[0].clientY;},{passive:true});

function project(x,y,z){
 // rotate Y
 let cx=Math.cos(rotY),sz=Math.sin(rotY);
 let x1=x*cx-z*sz,z1=x*sz+z*cx;
 // rotate X
 let cy=Math.cos(rotX),sy=Math.sin(rotX);
 let y1=y*cy-z1*sy,z2=y*sy+z1*cy;
 const d=800;const s=d/(z2+d);
 return{sx:x1*s+W/2,sy:y1*s+H/2,z:z2,s};
}

let t=0;
function draw(){
 t+=0.016;if(!dragging)rotY+=autoRot;
 ctx.clearRect(0,0,W,H);
 // project all nodes
 const proj=nodes.map((n,i)=>{
  const fy=Math.sin(t*1.5+n.off)*3;
  return{...project(n.x,n.y+fy,n.z),idx:i};
 });
 // draw links
 ctx.lineWidth=1;
 for(const[i,j]of links){
  const a=proj[i],b=proj[j];
  const avgZ=(a.z+b.z)/2;const op=Math.max(0.04,Math.min(0.15,(400-avgZ)/800));
  ctx.strokeStyle=`rgba(255,255,255,${op})`;
  ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();
 }
 // sort by z for painter's order
 proj.sort((a,b)=>a.z-b.z);
 for(const p of proj){
  const n=nodes[p.idx];const r=n.sz*p.s;
  const op=Math.max(0.3,Math.min(0.8,(400-p.z)/800));
  ctx.fillStyle=`rgba(255,255,255,${op*0.6})`;
  ctx.beginPath();ctx.arc(p.sx,p.sy,r,0,6.283);ctx.fill();
  if(r>4){
   ctx.fillStyle=`rgba(255,255,255,${op})`;
   ctx.font=`${Math.max(9,r*1.1)|0}px system-ui,sans-serif`;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText(n.label,p.sx,p.sy-r-6);
  }
 }
 requestAnimationFrame(draw);
}
draw();
})();
