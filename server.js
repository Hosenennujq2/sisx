// server.js — بدون أي مكتبات خارجية. التشغيل:  node server.js
// يحفظ كل شيء (الحسابات، المفاتيح، العملات...) في الملف data/db.json
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000,DIR=process.env.DATA_DIR||path.join(__dirname,'data'),FILE=path.join(DIR,'db.json');
const RAR=['common','rare','epic','legendary'],PZ=[10,25,100,5,50,15,200,20],WT=[20,18,4,25,10,18,1,14],DAY=864e5;
const hashPw=(p,s=crypto.randomBytes(16).toString('hex'))=>s+':'+crypto.scryptSync(p,s,64).toString('hex');
const okPw=(p,h)=>{const[s,x]=h.split(':');return crypto.timingSafeEqual(crypto.scryptSync(p,s,64),Buffer.from(x,'hex'))};
const mkUser=(u,p,role,coins)=>({u,p:hashPw(p),role,pk:[],coins,xp:0,last:0,streak:0,spin:0,ban:false,orders:[]});
const S=(x,n=200)=>String(x??'').trim().slice(0,n),P=x=>String(x||'').slice(0,100);
const need=(c,m)=>{if(!c)throw{c:400,m}};
let db;fs.mkdirSync(DIR,{recursive:true});
try{db=JSON.parse(fs.readFileSync(FILE,'utf8'))}catch(e){}
function save(){fs.writeFileSync(FILE+'.tmp',JSON.stringify(db));fs.renameSync(FILE+'.tmp',FILE)}
if(!db){const ap=process.env.ADMIN_PASS||'admin123',d=new Date().toLocaleDateString('ar');
 db={settings:{name:'سيرفر الأسطورة',cfx:'xxxxxx',discord:'https://discord.gg/xxxx',slots:128,desc:'أقوى سيرفر رول بلاي عربي. عالم مفتوح، اقتصاد حقيقي، ومجتمع يحترمك.',rules:'احترام جميع اللاعبين والإدارة\nممنوع القتل العشوائي (RDM)\nممنوع الهروب من الرول بلاي (Fail RP)\nممنوع استخدام الهكر أو الثغرات\nممنوع السب والإساءة بكل أنواعها\nاتباع تعليمات الإدارة دائماً'},
 users:[mkUser('admin',ap,'admin',1000)],
 packages:[{id:1,name:'VIP برونزية',price:'25 ر.س',coins:250,rar:'rare',perks:'أولوية دخول\nسيارة خاصة\nرتبة ديسكورد'},{id:2,name:'VIP فضية',price:'50 ر.س',coins:500,rar:'epic',perks:'كل مميزات البرونزية\nمنزل خاص\n100,000$ داخل اللعبة'},{id:3,name:'VIP ذهبية',price:'100 ر.س',coins:1000,rar:'legendary',perks:'كل مميزات الفضية\nوظيفة حصرية\nسيارة سوبر + سلاح مميز'}],
 keys:[],coupons:[{c:'WELCOME',pct:20,left:100}],
 news:[{id:1,t:'🎉 افتتاح السيرفر رسمياً',b:'انضموا إلينا الآن واحصلوا على 100 عملة هدية عند التسجيل!',d},{id:2,t:'🎡 عجلة الحظ والمكافأة اليومية متاحة',b:'ادخل حسابك كل يوم لتجمع العملات وترفع مستواك.',d}],sessions:{}};
 save();console.log('✅ تم إنشاء data/db.json — حساب الأدمن: admin / '+ap+'  (غيّر كلمة المرور فوراً!)')}
for(const t in db.sessions)if(db.sessions[t].exp<Date.now())delete db.sessions[t];
const hits={},limit=ip=>{const n=Date.now(),a=(hits[ip]||[]).filter(t=>n-t<3e5);a.push(n);hits[ip]=a;need(a.length<=20,'محاولات كثيرة، انتظر قليلاً')};
const who=(n,self)=>{const t=db.users.find(x=>x.u==n);need(t,'العضو غير موجود');need(!self||t!==self,'لا يمكنك تنفيذ هذا على نفسك');return t};
const kill=n=>{for(const t in db.sessions)if(db.sessions[t].u==n)delete db.sessions[t]};
const findCp=c=>db.coupons.find(x=>x.c==S(c,30).toUpperCase()&&x.left>0);
const pub=u=>({u:u.u,role:u.role,coins:u.coins,xp:u.xp,last:u.last,streak:u.streak,spin:u.spin,pk:u.pk,orders:u.orders});
function state(user){const adm=user&&user.role=='admin';
 return{db:{settings:db.settings,packages:db.packages,news:db.news,stats:{users:db.users.length,keysUsed:db.keys.filter(k=>k.used).length},
 users:adm?db.users.map(x=>({...pub(x),ban:x.ban})):[...db.users].sort((a,b)=>b.xp-a.xp).slice(0,10).map(x=>({u:x.u,xp:x.xp})),
 keys:adm?db.keys:[],coupons:adm?db.coupons:[]},me:user?pub(user):null}}
const H={
 register:(b,_,x)=>{limit(x.ip);const u=S(b.u,20),p=P(b.p);need(/^[A-Za-z0-9_\u0600-\u06FF]{3,20}$/.test(u),'اسم غير صالح (3-20 حرف)');need(p.length>=6,'كلمة المرور قصيرة');need(!db.users.some(a=>a.u.toLowerCase()==u.toLowerCase()),'الاسم مستخدم');db.users.push(mkUser(u,p,'user',100));save()},
 login:(b,_,x)=>{limit(x.ip);const a=db.users.find(a=>a.u.toLowerCase()==S(b.u,20).toLowerCase());need(a&&okPw(P(b.p),a.p),'بيانات خاطئة');need(!a.ban,'هذا الحساب محظور 🚫');const t=crypto.randomBytes(32).toString('hex');db.sessions[t]={u:a.u,exp:Date.now()+30*DAY};save();return{token:t}},
 logout:(b,u,x)=>{delete db.sessions[x.tok];save()},
 coupon:b=>{const c=findCp(b.code);need(c,'كوبون غير صالح');return{c:c.c,pct:c.pct}},
 buy:(b,u)=>{const p=db.packages.find(a=>a.id==b.id);need(p,'حزمة غير موجودة');const cp=b.coupon?findCp(b.coupon):null,c=cp?Math.ceil(p.coins*(100-cp.pct)/100):p.coins;need(u.coins>=c,'رصيدك غير كافٍ 🪙');u.coins-=c;if(!u.pk.includes(p.id))u.pk.push(p.id);u.orders.push({n:p.name,c,d:new Date().toLocaleString('ar')});u.xp+=30;if(cp)cp.left--;save()},
 daily:(b,u)=>{const n=Date.now();need(!u.last||n-u.last>=DAY,'جائزتك غير جاهزة بعد');u.streak=u.last&&n-u.last<2*DAY?u.streak+1:1;const c=20+Math.min(u.streak,7)*10;u.last=n;u.coins+=c;u.xp+=20;save();return{coins:c}},
 spin:(b,u)=>{need(!u.spin||Date.now()-u.spin>=DAY,'عد غداً ⏳');let r=crypto.randomInt(WT.reduce((a,c)=>a+c)),i=0;while(r>=WT[i]){r-=WT[i];i++}u.spin=Date.now();u.coins+=PZ[i];u.xp+=10;save();return{i,prize:PZ[i]}},
 redeem:(b,u)=>{const k=S(b.k,30).toUpperCase(),x=db.keys.find(a=>a.k==k);need(x,'مفتاح غير صحيح');need(!x.used,'المفتاح مستخدم');x.used=u.u;if(!u.pk.includes(x.pid))u.pk.push(x.pid);u.coins+=50;u.xp+=100;save()},
 password:(b,u)=>{const p=P(b.p);need(p.length>=6,'كلمة المرور قصيرة');u.p=hashPw(p);save()},
 'admin/pk-add':b=>{const n=S(b.name,60);need(n,'أدخل الاسم');db.packages.push({id:Date.now(),name:n,price:S(b.price,30),coins:Math.max(0,+b.coins||0),rar:RAR.includes(b.rar)?b.rar:'common',perks:S(b.perks,500)});save()},
 'admin/pk-del':b=>{db.packages=db.packages.filter(p=>p.id!=b.id);save()},
 'admin/keys-gen':b=>{need(db.packages.some(p=>p.id==b.pid),'اختر حزمة');const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for(let i=0,n=Math.min(50,Math.max(1,+b.n||1));i<n;i++)db.keys.push({k:Array.from({length:16},()=>c[crypto.randomInt(c.length)]).join('').match(/.{4}/g).join('-'),pid:+b.pid,used:null});save()},
 'admin/key-del':b=>{db.keys=db.keys.filter(k=>k.k!=b.k);save()},
 'admin/cp-add':b=>{const c=S(b.c,30).toUpperCase();need(c,'أدخل الكود');db.coupons.push({c,pct:Math.min(90,Math.max(1,+b.pct||10)),left:Math.max(1,+b.left||1)});save()},
 'admin/cp-del':b=>{db.coupons.splice(+b.i,1);save()},
 'admin/nw-add':b=>{const t=S(b.t,100);need(t,'أدخل العنوان');db.news.push({id:Date.now(),t,b:S(b.b,500),d:new Date().toLocaleDateString('ar')});save()},
 'admin/nw-del':b=>{db.news=db.news.filter(n=>n.id!=b.id);save()},
 'admin/user-give':b=>{who(b.u).coins+=Math.trunc(+b.n||0);save()},
 'admin/user-role':(b,u)=>{const t=who(b.u,u);t.role=t.role=='admin'?'user':'admin';save()},
 'admin/user-ban':(b,u)=>{const t=who(b.u,u);t.ban=!t.ban;kill(t.u);save()},
 'admin/user-del':(b,u)=>{const t=who(b.u,u);db.users=db.users.filter(x=>x!==t);kill(t.u);save()},
 'admin/settings':b=>{db.settings={name:S(b.name,40)||'سيرفر',cfx:S(b.cfx,40),slots:Math.min(2048,Math.max(1,+b.slots||128)),discord:S(b.discord,200),desc:S(b.desc,300),rules:S(b.rules,3000)};save()}
};
const send=(res,c,o)=>{res.writeHead(c,{'Content-Type':'application/json;charset=utf-8'});res.end(JSON.stringify(o))};
const body=req=>new Promise(r=>{let d='';req.on('data',c=>{d+=c;if(d.length>2e5)req.destroy()});req.on('end',()=>{try{r(JSON.parse(d||'{}'))}catch(e){r({})}})});
const MIME={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'text/javascript;charset=utf-8'},OK=['index.html','style.css','app.js'];
http.createServer(async(req,res)=>{
 res.setHeader('Access-Control-Allow-Origin',process.env.ORIGIN||'*');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
 if(req.method=='OPTIONS'){res.writeHead(204);return res.end()}
 const url=req.url.split('?')[0];
 if(!url.startsWith('/api/')){const f=url=='/'?'index.html':url.slice(1);if(!OK.includes(f)){res.writeHead(404);return res.end('404')}
  res.writeHead(200,{'Content-Type':MIME[path.extname(f)],'X-Content-Type-Options':'nosniff'});return res.end(fs.readFileSync(path.join(__dirname,f)))}
 try{const r=url.slice(5),tok=(req.headers.authorization||'').slice(7),s=db.sessions[tok],user=s&&s.exp>Date.now()?db.users.find(x=>x.u==s.u&&!x.ban):null,
  x={tok,ip:S(req.headers['x-forwarded-for']||req.socket.remoteAddress,60).split(',')[0]};
  if(r=='state')return send(res,200,state(user));
  need(Object.hasOwn(H,r)&&req.method=='POST','غير موجود');
  if(r!='register'&&r!='login'){if(!user)throw{c:401,m:'سجّل الدخول أولاً'};if(r.startsWith('admin/')&&user.role!='admin')throw{c:403,m:'غير مصرح'}}
  send(res,200,H[r](await body(req),user,x)||{ok:1})
 }catch(e){send(res,e.c||500,{error:e.m||'خطأ في الخادم'});if(!e.c)console.error(e)}
}).listen(PORT,()=>console.log('🚀 الموقع يعمل على: http://localhost:'+PORT));
