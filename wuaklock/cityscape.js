/* Original WuakLock skyline. Geometry is typeset once into cached glyph layers.
   On load the emblem grows in, its exact spire rises to crown the central tower, and the city is
   built outward from it. After that there is no idle loop: motion runs only until pointer/scroll
   changes settle. */
(() => {
  'use strict';
  const canvas = document.getElementById('cityscape');
  const stage = canvas?.closest('.city-stage');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !stage || !ctx) return;

  const WIDTH = 1600, HEIGHT = 900;
  const INK = [227, 220, 202];
  const font = '"Geist Mono", ui-monospace, monospace';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.getElementById('motion-toggle');
  let manualPause = false, visible = true, width = 0, height = 0, dpr = 1;
  let layers = [], frame = 0, resizeTimer = 0, destroyed = false;
  const target = {x: 0, y: 0}, current = {x: 0, y: 0};
  // The emblem's spire crowns the tower, lifted from the artwork (1254 px emblem space).
  const SPIRE = {x0: 522, x1: 734, y0: 55, y1: 400};
  const CROWN = {x: 1090, bottom: 335, width: 180};
  const EMBLEM = {eyeX: 1090, eyeY: 470, size: 560, eye: [627/1254, 655/1254], ring: 300/1254, pitch: 12};
  const SMALL = {eye: [230/460, 213/460], ring: 120/460, pitch: 6};
  const T = {appear: 350, grow: 900, grown: 2300, rise: 2600, riseEnd: 3700, shaft: 3200, shaftEnd: 4000, city: 3400, cityEnd: 5300};
  const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  let art = null, introStart = 0, introDone = false, scratch = null;
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
  const smooth = (a, b, v) => { const t = clamp((v - a)/(b - a), 0, 1); return t*t*(3 - 2*t); };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const noise = (x, y) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const makeCanvas = () => {
    const c = document.createElement('canvas'); c.width = WIDTH; c.height = HEIGHT; return c;
  };
  const motionAllowed = () => !reduced.matches && !manualPause;

  function geometry(draw) {
    const source = makeCanvas(), g = source.getContext('2d', {willReadFrequently: true});
    if (!g) return source;
    const fill = value => {g.fillStyle = `rgb(${value},${value},${value})`;};
    const box = (x, y, w, h, value = 100) => {fill(value); g.fillRect(x, y, w, h);};
    const path = (points, value = 100) => {
      fill(value); g.beginPath(); points.forEach(([x,y], i) => i ? g.lineTo(x,y) : g.moveTo(x,y)); g.closePath(); g.fill();
    };
    const stroke = (points, value = 220, size = 3) => {
      g.strokeStyle = `rgb(${value},${value},${value})`; g.lineWidth = size;
      g.beginPath(); points.forEach(([x,y], i) => i ? g.lineTo(x,y) : g.moveTo(x,y)); g.stroke();
    };
    const arch = (x,y,w,h,value=190,size=3) => {
      g.strokeStyle = `rgb(${value},${value},${value})`; g.lineWidth=size; g.beginPath();
      g.moveTo(x,y+h); g.lineTo(x,y+w/2); g.arc(x+w/2,y+w/2,w/2,Math.PI,0); g.lineTo(x+w,y+h); g.stroke();
    };
    const windows = (x,y,w,h,pitchX=15,pitchY=18,value=180) => {
      for (let a=x; a<x+w; a+=pitchX) for(let b=y;b<y+h;b+=pitchY) {
        if(noise(a,b)>.27) box(a,b,3.8,7,noise(a,b)>.82?value:value*.58);
      }
    };
    const tank = (x,y,size=1,value=155) => {
      stroke([[x-11*size,y+38*size],[x-8*size,y],[x+8*size,y],[x+11*size,y+38*size]],value,2.8);
      stroke([[x-10*size,y+22*size],[x+10*size,y+34*size],[x-10*size,y+34*size],[x+10*size,y+22*size]],value,2);
      box(x-14*size,y-24*size,28*size,37*size,value*.55);
      path([[x-18*size,y-24*size],[x,y-38*size],[x+18*size,y-24*size]],value);
      stroke([[x-14*size,y-23*size],[x-14*size,y+12*size],[x+14*size,y+12*size],[x+14*size,y-23*size]],value,3);
    };
    const block = (x,y,w,h,value=100) => {
      box(x,y,w,h,value*.25); stroke([[x,y+h],[x,y],[x+w,y],[x+w,y+h]],value,3);
      box(x-4,y-5,w+8,6,value*.75); windows(x+8,y+16,w-12,h-22,15,21,value);
    };
    draw({g,fill,box,path,stroke,arch,windows,tank,block});
    return source;
  }

  function typeset(source, opacity, pitch = 4.8, occludes = false) {
    const output = makeCanvas(), o = output.getContext('2d');
    const sourceContext = source.getContext('2d');
    if (!o || !sourceContext) return output;
    const pixels = sourceContext.getImageData(0,0,WIDTH,HEIGHT).data;
    // Near buildings have solid shadow planes, so the distant streets cannot
    // show through their masonry. Glyphs remain the only visible light.
    if(occludes){
      o.drawImage(source,0,0);o.globalCompositeOperation='source-in';
      o.fillStyle='#080b0b';o.fillRect(0,0,WIDTH,HEIGHT);o.globalCompositeOperation='source-over';
    }
    const rowHeight = 6.5;
    o.font=`500 7.3px ${font}`; o.textAlign='center'; o.textBaseline='middle';
    for(let y=3.25;y<HEIGHT;y+=rowHeight) for(let x=pitch/2;x<WIDTH;x+=pitch) {
      const i=(Math.floor(y)*WIDTH+Math.floor(x))*4;
      const alpha=pixels[i+3]/255, value=pixels[i]/255;
      if(alpha<.1 || value<.025) continue;
      const n=noise(x,y);
      const char=value>.82 ? (n>.84?'+':'#') : value>.57 ? (n>.63?'|':'+') : value>.3 ? (n>.68?':':'=') : (n>.45?'.':':');
      o.fillStyle=`rgba(${INK.join(',')},${alpha*opacity*(.22+value*.78)})`;
      o.fillText(char,x,y);
    }
    return output;
  }

  function createLayers() {
    const sky = geometry(({g,fill,stroke}) => {
      // An occult transit diagram is barely visible behind the central spire.
      for (let ring=0;ring<3;ring++) {
        g.strokeStyle=`rgb(${72-ring*16},${72-ring*16},${72-ring*16})`; g.lineWidth=2;
        g.setLineDash(ring===1?[3,9]:[3,4]); g.beginPath(); g.arc(1090,427,226+ring*24,0,Math.PI*2);g.stroke();
      }
      g.setLineDash([]);
      for(let n=0;n<32;n++) {
        const a=n/32*Math.PI*2, r=n%4===0?270:260;
        stroke([[1090+Math.cos(a)*r,427+Math.sin(a)*r],[1090+Math.cos(a)*(r+8),427+Math.sin(a)*(r+8)]],100,2);
      }
      // Sparse atmosphere: no moving particles, gradients, or shader passes.
      for(let y=80;y<790;y+=14) for(let x=380;x<1600;x+=13) {
        const distance=Math.hypot((x-1080)*.8,y-510);
        if(noise(x,y)>.93 && distance<540) {fill(36+(1-distance/540)*48);g.fillRect(x,y,2,2);}
      }
    });
    const distant = geometry(({box,path,stroke,windows,tank,block}) => {
      const heights=[723,684,735,653,703,694,624,687,658,720,671,702,612,662,715,677,634,680,724,650,670,714,620,699,665,688];
      heights.forEach((y,i)=> {
        const x=i*66-30,w=44+noise(i,5)*32;
        block(x,y,w,900-y,112);
        if(i%3===1)tank(x+w*.5,y-22,.65,125);
        if(i%4===0)box(x+8,y-16,w-16,13,93);
      });
      // Eastern clockhouse and industrial chimneys.
      path([[1425,660],[1425,566],[1448,566],[1448,539],[1456,539],[1456,518],[1470,518],[1470,539],[1480,539],[1480,566],[1504,566],[1504,820]],115);
      stroke([[1463,480],[1463,520]],150,3);
      windows(1435,584,60,190,12,20,150);
      [272,304,332].forEach((x,i)=>{box(x,601-i*12,11,220,92);box(x-3,597-i*12,17,7,155);});
      // Distant railway disappears into the perspective of the streets.
      stroke([[0,785],[620,752],[1580,738]],132,4);
      for(let x=0;x<1600;x+=55)stroke([[x,784-x*.027],[x+10,850]],90,3);
    });
    const district = geometry(({g,box,path,stroke,arch,windows,tank,block}) => {
      // Western Art Deco exchange, stepped shoulders with narrow illuminated ribs.
      path([[514,900],[514,590],[535,590],[535,548],[551,548],[551,516],[578,516],[578,486],[598,486],[598,516],[623,516],[623,549],[644,549],[644,591],[661,591],[661,900]],67);
      stroke([[514,900],[514,590],[535,590],[535,548],[551,548],[551,516],[578,516],[578,486],[598,486],[598,516],[623,516],[623,549],[644,549],[644,591],[661,591],[661,900]],190,4);
      stroke([[588,454],[588,489]],210,3);
      for(let x=540;x<642;x+=17){const y=535+Math.abs(x-589)*1.1;stroke([[x,y],[x,830]],162,3);}
      for(let y=610;y<845;y+=27)box(521,y,131,3,91);
      // Narrow gothic watchtower and sloping roof line at the water.
      path([[704,900],[704,658],[722,658],[722,568],[734,568],[734,521],[748,521],[748,486],[759,521],[768,521],[768,568],[782,568],[782,658],[799,658],[799,900]],84);
      stroke([[722,658],[722,568],[734,568],[734,521],[748,486],[759,521],[768,521],[768,568],[782,568],[782,658]],220,3);
      arch(739,557,22,76,225,4); windows(715,685,78,160,15,21,190);
      // Rounded observatory. Its ribs contrast the city's rectilinear mass.
      box(1242,570,171,330,38);
      g.fillStyle='#434343';g.beginPath();g.ellipse(1327,573,82,66,0,Math.PI,0);g.fill();
      g.strokeStyle='#a0a0a0';g.lineWidth=4;g.beginPath();g.ellipse(1327,573,82,66,0,Math.PI,0);g.stroke();
      for(let r=1;r<5;r++){g.strokeStyle='#686868';g.lineWidth=2.5;g.beginPath();g.ellipse(1327,573,15*r,66,0,Math.PI,0);g.stroke();}
      stroke([[1327,475],[1327,509]],155,3);box(1240,574,175,8,170);
      windows(1254,602,145,193,17,24,150);
      for(let x=1260;x<1400;x+=29)stroke([[x,589],[x,808]],125,3);
      // Foreground-right apartment terraces and long elevator turret.
      block(1440,588,136,312,185);block(1480,551,58,349,195);
      stroke([[1509,516],[1509,551]],195,3);tank(1458,568,.78,170);
      // A suspended line: catenary cables and a small transit carriage.
      g.strokeStyle='#929292';g.lineWidth=2.8;g.beginPath();g.moveTo(754,557);g.quadraticCurveTo(1012,745,1495,553);g.stroke();
      g.beginPath();g.moveTo(754,565);g.quadraticCurveTo(1012,753,1495,561);g.stroke();
      stroke([[1228,632],[1228,649]],216,3);box(1208,651,44,23,46);
      stroke([[1208,672],[1208,651],[1252,651],[1252,672],[1208,672]],225,3);
      windows(1213,656,32,7,10,9,255);
      // Raised viaduct: repeated arches, visible structure instead of a flat slab.
      box(670,792,780,18,170);box(672,811,778,89,40);
      for(let x=680;x<1425;x+=90){
        g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(x+12,900);g.lineTo(x+12,857);g.arc(x+44,857,32,Math.PI,0);g.lineTo(x+76,900);g.fill();g.globalCompositeOperation='source-over';
        arch(x+7,819,74,90,145,4);
      }
      for(let x=675;x<1450;x+=17)stroke([[x,782],[x,796]],173,3);
      stroke([[670,782],[1450,782]],185,3);
      // The older docks to the left remain subordinate to the headline.
      block(-18,762,141,138,145);block(159,739,124,161,132);block(331,756,115,144,154);
      tank(205,716,1,150);tank(383,732,.7,162);
      stroke([[74,763],[83,683],[96,763]],141,3);stroke([[56,693],[150,693],[110,722]],155,3);
      stroke([[138,696],[138,752]],131,2);
    });
    const tower = geometry(({g,box,path,stroke,arch,windows}) => {
      // The crown grows from the selected emblem's stepped, parallel flutes.
      const outer=[[945,900],[945,598],[965,598],[965,471],[985,471],[985,351],[1005,351],[1005,274],[1025,274],[1025,223],[1046,223],[1046,188],[1061,188],[1061,159],[1075,159],[1090,112],[1105,159],[1119,159],[1119,188],[1134,188],[1134,223],[1155,223],[1155,274],[1175,274],[1175,351],[1195,351],[1195,471],[1215,471],[1215,598],[1235,598],[1235,900]];
      path(outer,28);stroke(outer,244,3.8);
      // Asymmetric shadow planes give the shaft physical depth.
      path([[1090,113],[1105,159],[1119,159],[1119,188],[1134,188],[1134,223],[1155,223],[1155,274],[1175,274],[1175,351],[1195,351],[1195,900],[1090,900]],42);
      for(const [x,y,end] of [[974,490,900],[994,369,900],[1014,292,900],[1035,241,900],[1055,205,900],[1071,176,329],[1109,176,329],[1125,205,900],[1145,241,900],[1165,292,900],[1185,369,900],[1205,490,900]]) {
        stroke([[x,y],[x,end]],x<1090?246:180,x<1090?4.4:3.5);
        stroke([[x-4,y-8],[x+4,y-8]],245,3);
      }
      // Tiny setback buttresses and finials repeat the tower mark's rhythm.
      for(const [x,y] of [[989,351],[1009,274],[1029,223],[1050,187],[1130,187],[1151,223],[1171,274],[1191,351]]){
        stroke([[x,y-18],[x,y-5]],220,3);stroke([[x-4,y-13],[x+4,y-13]],220,2.6);
      }
      stroke([[1090,66],[1090,111]],255,4);stroke([[1082,87],[1098,87]],255,3);
      box(1088,52,4,5,255);box(1088,39,4,4,210);
      stroke([[1090,144],[1090,309]],210,3);
      for(let y=158;y<310;y+=24)box(1086,y,8,5,232);
      // Ocular aperture sits in a circular mechanical halo.
      g.fillStyle='#030303';g.beginPath();g.arc(1090,389,58,0,Math.PI*2);g.fill();
      g.strokeStyle='#d3d3d3';g.lineWidth=3;g.beginPath();g.arc(1090,389,58,0,Math.PI*2);g.stroke();
      g.strokeStyle='#616161';g.lineWidth=2;g.beginPath();g.arc(1090,389,69,0,Math.PI*2);g.stroke();
      g.strokeStyle='#f1f1f1';g.lineWidth=5;g.beginPath();g.moveTo(1048,389);g.quadraticCurveTo(1090,345,1132,389);g.quadraticCurveTo(1090,431,1048,389);g.stroke();
      g.fillStyle='#e6e6e6';g.beginPath();g.ellipse(1090,389,9,24,0,0,Math.PI*2);g.fill();
      stroke([[1090,319],[1090,333]],236,3);stroke([[1090,445],[1090,462]],226,3);
      for(let y=478;y<855;y+=27){box(1087,y,6,11,230);}
      for(let x=1022;x<1170;x+=20){
        if(Math.abs(x-1090)<23)continue;
        windows(x,480,4,380,20,27,200);
      }
      // At street level, a monumental entrance and an engraved W.
      arch(1048,725,84,175,228,4);arch(1060,742,60,158,145,3);
      stroke([[1072,662],[1081,697],[1090,677],[1099,697],[1108,662]],239,4.3);
      [603,624].forEach(y=>box(950,y,280,3,105));
      // Balconies make the building read as architecture, not a stretched logo.
      for(const y of [530,580,721]){box(970,y,240,6,178);box(977,y+6,226,9,45);}
    });
    const foreground = geometry(({g,box,path,stroke,arch,windows,tank,block}) => {
      // Near-black foreground cutouts with lit roof edges; irregular parapets.
      block(-24,835,201,95,125);block(198,811,162,119,166);block(385,843,133,87,157);
      block(520,805,117,125,169);tank(566,777,.95,190);
      path([[0,900],[0,864],[80,864],[80,847],[103,847],[103,864],[164,864],[164,900]],20);
      // Type on a roof sign is fictional scene dressing, not product data.
      stroke([[813,825],[813,737],[928,737],[928,825]],168,3);box(819,743,103,44,22);
      g.font=`600 16px ${font}`;g.fillStyle='#d1d1d1';g.textAlign='center';g.fillText('NIGHT LINE',870,769);
      stroke([[825,788],[825,822],[914,788],[914,822]],118,3);
      block(1270,845,185,90,145);block(1482,788,149,142,177);
      tank(1524,757,.95,204);
      // Street cables draw the eye back toward the central district.
      g.strokeStyle='#a0a0a0';g.lineWidth=3;g.beginPath();g.moveTo(-50,792);g.quadraticCurveTo(240,904,553,793);g.stroke();
      stroke([[111,778],[111,900]],158,4);stroke([[98,795],[124,795]],180,3);
      stroke([[390,808],[390,900]],173,4);stroke([[377,824],[403,824]],191,3);
      // Darken the lowest row naturally with sparse glyphs rather than a hard crop.
      box(0,892,1600,8,14);
    });
    layers = [
      {image:typeset(sky,.48),depth:.12},
      {image:typeset(distant,.31),depth:.25},
      {image:typeset(district,.61),depth:.53},
      {image:typeset(tower,.94,4.8,true),depth:.68},
      {image:typeset(foreground,.8,4.8,true),depth:1},
    ];
  }

  function view() {
    const scale=Math.max(width/WIDTH,height/HEIGHT), viewWidth=width/scale, focal=width<700?.61:.68;
    const originX=width<1100?clamp(1090-viewWidth*focal,0,WIDTH-viewWidth):(WIDTH-viewWidth)/2;
    const originY=Math.max(0,(HEIGHT-height/scale)*.38);
    return {scale, originX, originY};
  }
  // Draw in 1600x900 source space, shifted by a layer's parallax depth.
  function place(c, v, depth) {
    const x=motionAllowed()?current.x*depth:0, y=motionAllowed()?current.y*depth:0;
    c.setTransform(dpr*v.scale,0,0,dpr*v.scale,(-v.originX+x)*dpr*v.scale,(-v.originY+y)*dpr*v.scale);
  }
  const crown = () => { const k=CROWN.width/(SPIRE.x1-SPIRE.x0), h=(SPIRE.y1-SPIRE.y0)*k; return {k, x:CROWN.x-CROWN.width/2, y:CROWN.bottom-h, w:CROWN.width, h}; };
  function drawCrown(c, box, alpha) {
    if(!art||alpha<=0)return; c.globalAlpha=alpha*.78;
    c.drawImage(art.big,SPIRE.x0,SPIRE.y0,SPIRE.x1-SPIRE.x0,SPIRE.y1-SPIRE.y0,box.x,box.y,box.w,box.h); c.globalAlpha=1;
  }
  // An emblem image drawn with an ordered dither. keep(threshold) decides which cells stay.
  function dithered(v, image, x, y, size, pitch, eye, reach, keep, mask) {
    if(!scratch||scratch.width!==canvas.width||scratch.height!==canvas.height){scratch=document.createElement('canvas');scratch.width=canvas.width;scratch.height=canvas.height;}
    const s=scratch.getContext('2d'); s.setTransform(1,0,0,1,0,0); s.clearRect(0,0,scratch.width,scratch.height);
    place(s,v,.68); s.drawImage(image,x,y,size,size);
    s.globalCompositeOperation='destination-out';
    if(mask)mask(s);
    s.beginPath();
    for(let r=0,py=y;py<y+size;r++,py+=pitch)for(let c=0,px=x;px<x+size;c++,px+=pitch){
      const d=Math.min(1,Math.hypot(px+pitch/2-eye[0],py+pitch/2-eye[1])/reach);
      if(!keep(BAYER[(r%4)*4+(c%4)]/16,d))s.rect(px-.3,py-.3,pitch+.6,pitch+.6);
    }
    s.fill(); s.globalCompositeOperation='source-over';
    ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(scratch,0,0);
  }
  // A layer revealed floor by floor from the street, sweeping out from the tower (b: 0..1).
  function buildLayer(v, layer, b, lag) {
    if(b<=0)return;
    if(b>=1){place(ctx,v,layer.depth);ctx.drawImage(layer.image,0,0);return;}
    place(ctx,v,layer.depth); ctx.save(); ctx.beginPath();
    const edges=[];
    for(let X=0;X<WIDTH;X+=16){
      const delay=Math.min(1,Math.abs(X+8-CROWN.x)/760)*.55+lag+noise(X,7)*.04;
      const p=ease(clamp((b-delay)/.4,0,1)); if(p<=0)continue;
      const top=HEIGHT*(1-p); ctx.rect(X,top,16.5,HEIGHT-top); if(p<1)edges.push([X,top]);
    }
    ctx.clip(); ctx.drawImage(layer.image,0,0); ctx.restore();
    // the rising edge of each building, brightened as it is laid
    ctx.globalCompositeOperation='lighter';
    for(const [X,top] of edges)ctx.drawImage(layer.image,X,top,16,7,X,top,16,7);
    ctx.globalCompositeOperation='source-over';
  }
  function paint(now=performance.now()) {
    if(!width || !height || !layers.length) return;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
    const v=view(), t=introDone||!art?Infinity:now-introStart, box=crown();
    const [sky,distant,district,tower,fore]=layers;
    if(t>=T.cityEnd){
      for(const layer of [sky,distant,district]){place(ctx,v,layer.depth);ctx.drawImage(layer.image,0,0);}
      place(ctx,v,tower.depth);ctx.save();ctx.beginPath();ctx.rect(0,CROWN.bottom,WIDTH,HEIGHT);ctx.clip();ctx.drawImage(tower.image,0,0);ctx.restore();
      drawCrown(ctx,box,1);
      place(ctx,v,fore.depth);ctx.drawImage(fore.image,0,0);
      ctx.setTransform(1,0,0,1,0,0); stage.dataset.cityReady='true'; return;
    }
    stage.dataset.cityReady='true';
    const E=EMBLEM.size, ex=EMBLEM.eyeX-EMBLEM.eye[0]*E, ey=EMBLEM.eyeY-EMBLEM.eye[1]*E, eye=[EMBLEM.eyeX,EMBLEM.eyeY];
    // the city, built outward from the tower
    const b=clamp((t-T.city)/(T.cityEnd-T.city),0,1);
    if(b>0){place(ctx,v,sky.depth);ctx.globalAlpha=smooth(0,.5,b);ctx.drawImage(sky.image,0,0);ctx.globalAlpha=1;}
    buildLayer(v,distant,b,.12); buildLayer(v,district,b,.04);
    // the tower body extrudes down from the crown to the street
    const sh=ease(clamp((t-T.shaft)/(T.shaftEnd-T.shaft),0,1));
    if(sh>0){place(ctx,v,tower.depth);ctx.save();ctx.beginPath();const end=CROWN.bottom+(HEIGHT-CROWN.bottom)*sh;ctx.rect(0,CROWN.bottom,WIDTH,end-CROWN.bottom);ctx.clip();ctx.drawImage(tower.image,0,0);ctx.restore();
      if(sh<1){ctx.globalCompositeOperation='lighter';ctx.drawImage(tower.image,900,end-7,380,7,900,end-7,380,7);ctx.globalCompositeOperation='source-over';}}
    buildLayer(v,fore,b,.2);
    // the emblem: the small mark grows in, then the body dithers away from the rays inward
    const reach=EMBLEM.ring*E*2.7;
    if(t<T.grown+200){
      const a=ease(clamp(t/T.appear,0,1)), g=ease(clamp((t-T.grow)/(T.grown-T.grow),0,1));
      const small=E*EMBLEM.ring*.6/SMALL.ring*(1+(1/.6-1)*g)*(1+(1-a)*.05);
      if(g<1)dithered(v,art.small,EMBLEM.eyeX-SMALL.eye[0]*small,EMBLEM.eyeY-SMALL.eye[1]*small,small,small*SMALL.pitch/460,eye,reach,(n,d)=>a>=1?n*.3+(1-d)*.7>=g*1.02:n<a*1.01);
      if(g>0){const size=E*(.6+.4*g);dithered(v,art.big,EMBLEM.eyeX-EMBLEM.eye[0]*size,EMBLEM.eyeY-EMBLEM.eye[1]*size,size,size*EMBLEM.pitch/1254,eye,reach*(.6+.4*g),(n,d)=>n*.3+d*.7<=g*1.02);}
    } else {
      const d0=clamp((t-T.rise)/(T.riseEnd-T.rise-300),0,1);
      if(d0<1)dithered(v,art.big,ex,ey,E,E*EMBLEM.pitch/1254,eye,reach,(n,d)=>n*.3+(1-d)*.7>=d0*1.02,s=>{const k=E/1254;s.fillRect(ex+SPIRE.x0*k,ey+SPIRE.y0*k-1,(SPIRE.x1-SPIRE.x0)*k,(SPIRE.y1-SPIRE.y0)*k+1);});
      // the spire as one piece: from its place on the emblem up into the crown
      const r=ease(clamp((t-T.rise)/(T.riseEnd-T.rise),0,1)), k0=E/1254;
      const from={x:ex+SPIRE.x0*k0,y:ey+SPIRE.y0*k0,w:(SPIRE.x1-SPIRE.x0)*k0,h:(SPIRE.y1-SPIRE.y0)*k0};
      place(ctx,v,tower.depth);
      drawCrown(ctx,{x:from.x+(box.x-from.x)*r,y:from.y+(box.y-from.y)*r,w:from.w+(box.w-from.w)*r,h:from.h+(box.h-from.h)*r},1);
    }
    ctx.setTransform(1,0,0,1,0,0);
  }
  function intro(now) {
    if(destroyed)return;
    paint(now);
    if(now-introStart<T.cityEnd+50)requestAnimationFrame(intro);else{introDone=true;paint();}
  }
  // Recolour the cream artwork as glyph ink with transparency, matching the city.
  function ink(image) {
    const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
    const o=c.getContext('2d');o.drawImage(image,0,0);const img=o.getImageData(0,0,c.width,c.height),d=img.data;
    for(let i=0;i<d.length;i+=4){const l=(d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722)/255;d[i]=INK[0];d[i+1]=INK[1];d[i+2]=INK[2];d[i+3]=clamp((l-.05)*1.35,0,1)*255;}
    o.putImageData(img,0,0);return c;
  }
  const loadImage=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});

  function animate() {
    frame=0;
    if(destroyed||!visible||document.hidden||!introDone)return;
    const dx=target.x-current.x,dy=target.y-current.y;
    current.x+=dx*.13;current.y+=dy*.13;
    if(!motionAllowed()){current.x=0;current.y=0;}
    paint();
    if(motionAllowed() && (Math.abs(dx)>.04||Math.abs(dy)>.04))frame=requestAnimationFrame(animate);
  }
  function requestPaint() {if(!frame&&!destroyed&&visible&&!document.hidden)frame=requestAnimationFrame(animate);}
  function resize() {
    const r=stage.getBoundingClientRect();
    const nextWidth=Math.round(r.width),nextHeight=Math.round(r.height);
    const nextDpr=Math.min(devicePixelRatio||1,2);
    if(nextWidth===width&&nextHeight===height&&nextDpr===dpr)return;
    width=nextWidth;height=nextHeight;dpr=nextDpr;
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    if(introDone)paint();
  }
  function updateToggle(){
    if(!toggle)return;
    toggle.setAttribute('aria-pressed',String(manualPause||reduced.matches));
    toggle.textContent=manualPause||reduced.matches?'Motion off':'Motion on';
    toggle.disabled=reduced.matches;
  }
  stage.addEventListener('pointermove',event=>{
    if(!motionAllowed()||event.pointerType==='touch')return;
    const r=stage.getBoundingClientRect();target.x=(.5-(event.clientX-r.left)/r.width)*12;target.y=(.5-(event.clientY-r.top)/r.height)*7;requestPaint();
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{target.x=0;target.y=0;requestPaint();},{passive:true});
  const onScroll=()=>{
    if(!motionAllowed()||!visible)return;
    target.y=clamp(-stage.getBoundingClientRect().top/height,-1,1)*12;requestPaint();
  };
  addEventListener('scroll',onScroll,{passive:true});
  toggle?.addEventListener('click',()=>{manualPause=!manualPause;target.x=0;target.y=0;updateToggle();requestPaint();});
  reduced.addEventListener('change',()=>{target.x=0;target.y=0;updateToggle();requestPaint();});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestPaint();
  });
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;if(visible)requestPaint();else{cancelAnimationFrame(frame);frame=0;}
  },{rootMargin:'80px'}).observe(stage);
  if('ResizeObserver' in window)new ResizeObserver(()=>{
    clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,80);
  }).observe(stage);else addEventListener('resize',resize,{passive:true});
  addEventListener('pagehide',()=>{destroyed=true;cancelAnimationFrame(frame);clearTimeout(resizeTimer);},{once:true});
  addEventListener('pageshow',event=>{if(event.persisted){destroyed=false;requestPaint();}});
  canvas.setAttribute('aria-hidden','true');
  updateToggle();
  const build=()=>{
    if(motionAllowed()&&scrollY<innerHeight*.5)stage.dataset.cityReady='true';
    createLayers();resize();
    Promise.all([loadImage('emblem-small.png'),loadImage('emblem.png')]).then(([small,big])=>{
      art={small:ink(small),big:ink(big)};
      if(!motionAllowed()||scrollY>innerHeight*.5){introDone=true;paint();return;}
      introStart=performance.now();requestAnimationFrame(intro);
    },()=>{introDone=true;paint();});
  };
  if(document.fonts?.load) document.fonts.load(`500 7.3px ${font}`).then(build,build);else build();
})();
