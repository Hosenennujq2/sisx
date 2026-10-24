
const K='fv2',S='fv2s',TH={p:['#a855f7','#22d3ee'],r:['#ef4444','#f59e0b'],g:['#22c55e','#a3e635'],b:['#3b82f6','#ec4899']};
const RR={common:'عادية',rare:'نادرة',epic:'ملحمية',legendary:'أسطورية'},RK=['مواطن','مقيم','محترف','نخبة','أسطورة'];
const PZ=[10,25,100,5,50,15,200,20],WT=[20,18,4,25,10,18,1,14];
const JB=[['🚓','الشرطة','حافظ على الأمن وطارد المجرمين'],['🚑','الإسعاف','أنقذ الأرواح داخل المدينة'],['🔧','الميكانيكي','أصلح وطوّر سيارات اللاعبين'],['🏪','التاجر','أدر متجرك واكسب الملايين'],['🕶️','العصابات','سيطر على الأحياء بذكاء'],['⚖️','القضاء','احكم بالعدل في المحكمة']];
let db,me=null,page='home',tab='st',cpn=null,wr=0,ol=0,col='#22d3ee';
const $=s=>document.querySelector(s),E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const lvl=u=>Math.floor(Math.sqrt(u.xp/40))+1;
const left=t=>{const m=Math.ceil((864e5-(Date.now()-t))/6e4);return Math.floor(m/60)+'س '+m%60+'د'};
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',2800)}
function cop(t){try{navigator.clipboard.writeText(t)}catch(e){}toast('تم النسخ ✅')}
function theme(t){const c=TH[t]||TH.p,r=document.documentElement.style;r.setProperty('--ac',c[0]);r.setProperty('--ac2',c[1]);col=c[1];try{localStorage.setItem('fv2t',t)}catch(e){}}

function fx(){const c=$('#bg'),x=c.getContext('2d');let w,h;const P=[],rs=()=>{w=c.width=innerWidth;h=c.height=innerHeight};rs();onresize=rs;
 for(let i=0;i<55;i++)P.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5});
 (function f(){x.clearRect(0,0,w,h);x.fillStyle=x.strokeStyle=col;P.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;x.globalAlpha=.7;x.fillRect(p.x,p.y,2,2);
 for(let j=i+1;j<P.length;j++){const q=P[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<120){x.globalAlpha=(1-d/120)*.25;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(q.x,q.y);x.stroke()}}});requestAnimationFrame(f)})()}
function cnt(){document.querySelectorAll('[data-n]').forEach(e=>{const t=+e.dataset.n;let v=0;const s=Math.max(1,Math.ceil(t/30)),i=setInterval(()=>{v=Math.min(t,v+s);e.textContent=v;if(v>=t)clearInterval(i)},30)})}
function go(p){page=p;render();scrollTo(0,0)}
function nav(){const L=[['home','الرئيسية'],['store','المتجر'],['guide','الدليل'],['board','المتصدرين']];if(me){L.push(['account','حسابي']);if(me.role=='admin')L.push(['admin','الإدارة'])}
 $('#nav').innerHTML=`<span class="lg">🎮 ${E(db.settings.name)}</span>`+L.map(([k,v])=>`<a class="${page==k?'on':''}" onclick="go('${k}')">${v}</a>`).join('')+(me?`<a onclick="out()">خروج</a><span class="co">🪙 ${me.coins}</span>`:`<a onclick="go('login')">دخول</a><a class="btn" onclick="go('reg')" style="padding:7px 14px">تسجيل</a>`)+Object.keys(TH).map(k=>`<i class="dt" style="background:${TH[k][0]}" onclick="theme('${k}')"></i>`).join('');
 $('#tk').innerHTML='<span>'+db.news.slice(-5).reverse().map(n=>E(n.t)).join('  ✦  ')+'</span>';$('#ft').textContent='© '+db.settings.name+' — جميع الحقوق محفوظة'}
function render(){nav();$('#app').innerHTML=({home,store,guide,board,account,admin,login,reg}[page]||home)();cnt()}
function home(){const s=db.settings,ku=db.stats.keysUsed;
 const F=[['⚡','أداء خرافي','سيرفر مستقر بدون لاج'],['💰','اقتصاد حقيقي','وظائف وأعمال وشركات'],['🚗','سيارات حصرية','مئات السيارات المعدّلة'],['🛡️','إدارة متواجدة','دعم على مدار الساعة'],['🎡','جوائز يومية','عجلة حظ ومكافآت'],['🏆','مستويات ورتب','تقدّم وتصدّر القائمة']];
 return`<div class="w"><section class="hero"><div class="pill">السيرفر يعمل الآن</div><h1>${E(s.name)}</h1><p>${E(s.desc)}</p>
 <div class="acts"><a class="btn" href="fivem://connect/cfx.re/join/${E(s.cfx)}">▶ ادخل السيرفر</a><button class="sec" onclick="cop('cfx.re/join/${E(s.cfx)}')">📋 نسخ الرابط</button><button class="sec" onclick="go('store')">🛒 المتجر</button><a class="btn sec" href="${E(s.discord)}" target="_blank" rel="noopener">💬 ديسكورد</a></div>
 <div class="stats"><div class="card st"><b id="on">${ol}</b><span>لاعب متصل / ${s.slots}</span></div><div class="card st"><b data-n="${db.stats.users}">0</b><span>عضو مسجل</span></div><div class="card st"><b data-n="${ku}">0</b><span>حزمة مفعّلة</span></div><div class="card st"><b data-n="${db.packages.length}">0</b><span>حزمة بالمتجر</span></div></div></section>
 <h2 style="margin-top:40px">✨ لماذا نحن؟</h2><div class="g">${F.map(f=>`<div class="card"><div style="font-size:34px">${f[0]}</div><h3>${f[1]}</h3><p class="mu">${f[2]}</p></div>`).join('')}</div>
 <h2 style="margin-top:40px">📰 آخر الأخبار</h2><div class="g">${db.news.slice(-3).reverse().map(n=>`<div class="card nw"><h3>${E(n.t)}</h3><p class="mu">${E(n.b)}</p><small>${E(n.d)}</small></div>`).join('')}</div></div>`}
function store(){return`<div class="w"><h2>🛒 المتجر<small>اشترِ بالعملات فوراً أو بالمال الحقيقي عبر الديسكورد</small></h2>
 <div class="card" style="margin-bottom:18px"><div class="row"><input id="cc" placeholder="كوبون خصم" style="direction:ltr;margin:0"><button onclick="useCp()" style="flex:0 0 auto">تطبيق</button></div>${cpn?`<p class="mu" style="margin:8px 0 0">✅ خصم ${cpn.pct}% مفعّل</p>`:''}</div>
 <div class="g">${db.packages.map(p=>{const c=cpn?Math.ceil(p.coins*(100-cpn.pct)/100):p.coins;return`<div class="card pk r-${p.rar}"><span class="bd">${RR[p.rar]}</span><h3 style="margin-top:8px">${E(p.name)}</h3><div class="pr">🪙 ${c}${cpn?`<span class="old">${p.coins}</span>`:''}</div><ul>${p.perks.split('\n').filter(x=>x.trim()).map(x=>`<li>${E(x)}</li>`).join('')}</ul>
 <button onclick="buy(${p.id})" style="width:100%;margin-bottom:8px">شراء بالعملات</button><button class="sec" onclick="cash(${p.id})" style="width:100%">شراء نقدي (${E(p.price)})</button></div>`}).join('')}</div></div>`}


function cash(id){const p=db.packages.find(x=>x.id==id);if(!me){toast('سجّل دخولك أولاً');return go('login')}if(confirm(`للشراء النقدي تواصل مع الإدارة على ديسكورد لدفع «${p.name}» واستلام المفتاح. فتح الديسكورد؟`))window.open(db.settings.discord,'_blank','noopener')}
function guide(){return`<div class="w"><h2>📜 قوانين السيرفر<small>اقرأها جيداً قبل الدخول</small></h2><div class="card"><ol class="rl">${db.settings.rules.split('\n').filter(x=>x.trim()).map(x=>`<li>${E(x)}</li>`).join('')}</ol></div>
 <h2 style="margin-top:34px">💼 الوظائف المتاحة</h2><div class="g">${JB.map(j=>`<div class="card"><div style="font-size:38px">${j[0]}</div><h3>${j[1]}</h3><p class="mu">${j[2]}</p></div>`).join('')}</div></div>`}
function board(){const U=[...db.users].sort((a,b)=>b.xp-a.xp).slice(0,10);return`<div class="w"><h2>🏆 قائمة المتصدرين<small>أعلى اللاعبين خبرة</small></h2><div class="card tb"><table><tr><th>#</th><th>اللاعب</th><th>الرتبة</th><th>المستوى</th><th>XP</th></tr>${U.map((u,i)=>`<tr><td>${['🥇','🥈','🥉'][i]||i+1}</td><td>${E(u.u)}</td><td>${RK[Math.min(4,Math.floor((lvl(u)-1)/3))]}</td><td>${lvl(u)}</td><td>${u.xp}</td></tr>`).join('')}</table></div></div>`}
function login(){return`<div class="card box"><h2>تسجيل الدخول</h2><label>اسم المستخدم</label><input id="u"><label>كلمة المرور</label><input id="p" type="password" onkeydown="if(event.key=='Enter')doLogin()"><button onclick="doLogin()" style="width:100%">دخول</button></div>`}
function reg(){return`<div class="card box"><h2>إنشاء حساب</h2><p class="mu">🎁 هدية تسجيل: 100 عملة</p><label>اسم المستخدم</label><input id="u"><label>كلمة المرور (6 أحرف فأكثر)</label><input id="p" type="password"><label>تأكيد كلمة المرور</label><input id="p2" type="password"><button onclick="doReg()" style="width:100%">تسجيل</button></div>`}



function account(){if(!me)return login();wr=0;const l=lvl(me),b=(l-1)**2*40,nx=l*l*40,pc=Math.min(100,(me.xp-b)/(nx-b)*100),rk=RK[Math.min(4,Math.floor((l-1)/3))],rd=!me.last||Date.now()-me.last>=864e5,sr=!me.spin||Date.now()-me.spin>=864e5,mine=me.pk.map(i=>db.packages.find(p=>p.id==i)).filter(Boolean);
 return`<div class="w"><div class="card prof"><div class="av">${E(me.u[0].toUpperCase())}</div><div style="flex:1;min-width:200px"><h2 style="margin:0">${E(me.u)} <span class="bd r-epic">${rk}</span></h2><p class="mu" style="margin:4px 0 0">المستوى ${l} • ${me.xp} XP • 🪙 ${me.coins}</p><div class="bar"><i style="width:${pc}%"></i></div></div></div>
 <div class="g" style="margin-top:16px"><div class="card"><h3>🎁 المكافأة اليومية</h3><p class="mu">سلسلتك: ${me.streak||0} يوم — كل يوم متتالٍ مكافأة أكبر!</p><button onclick="daily()" ${rd?'':'disabled'}>${rd?'استلم الآن':'بعد '+left(me.last)}</button></div>
 <div class="card"><h3>🎡 عجلة الحظ</h3><div class="wh"><div class="pt"></div><div id="wd">${PZ.map((p,i)=>`<i style="transform:rotate(${i*45+22.5}deg) translateY(-92px)">${p}</i>`).join('')}</div></div><button onclick="spin()" ${sr?'':'disabled'} style="width:100%">${sr?'لُف العجلة':'بعد '+left(me.spin)}</button></div>
 <div class="card"><h3>🔑 تفعيل مفتاح</h3><p class="mu">+50 عملة و100 XP مع كل مفتاح</p><input id="rk" placeholder="XXXX-XXXX-XXXX-XXXX" style="direction:ltr"><button onclick="redeem()" style="width:100%">تفعيل</button></div></div>
 <h2 style="margin-top:30px">📦 حزمي</h2><div class="g">${mine.length?mine.map(p=>`<div class="card pk r-${p.rar}"><span class="bd">${RR[p.rar]}</span><h3 style="margin-top:8px">${E(p.name)}</h3></div>`).join(''):'<p class="mu">لا توجد حزم مفعّلة.</p>'}</div>
 <h2 style="margin-top:30px">🧾 سجل الطلبات</h2><div class="card tb"><table>${me.orders.length?me.orders.slice().reverse().map(o=>`<tr><td>${E(o.n)}</td><td>🪙 ${o.c}</td><td>${E(o.d)}</td></tr>`).join(''):'<tr><td class="mu">لا طلبات بعد</td></tr>'}</table></div></div>`}



function admin(){if(!me||me.role!='admin')return home();
 const T=[['st','📊 الإحصائيات'],['pk','📦 الحزم'],['ky','🔑 المفاتيح'],['cp','🏷️ الكوبونات'],['nw','📰 الأخبار'],['us','👥 الأعضاء'],['se','⚙️ الإعدادات']],th=a=>`<div class="card tb"><table><tr>${a.map(x=>`<th>${x}</th>`).join('')}</tr>`;let b='';
 if(tab=='st'){const ku=db.keys.filter(k=>k.used).length;b=`<div class="g">${[['الأعضاء',db.users.length],['مفاتيح متاحة',db.keys.length-ku],['مفاتيح مستخدمة',ku],['عملات متداولة',db.users.reduce((a,u)=>a+u.coins,0)],['الطلبات',db.users.reduce((a,u)=>a+u.orders.length,0)]].map(([l,v])=>`<div class="card st"><b>${v}</b><span>${l}</span></div>`).join('')}</div>`}
 if(tab=='pk')b=`<div class="card" style="margin-bottom:16px"><div class="row"><div><label>الاسم</label><input id="pn"></div><div><label>السعر النقدي</label><input id="pp"></div><div><label>السعر بالعملات</label><input id="pc" type="number"></div><div><label>الندرة</label><select id="pr">${Object.keys(RR).map(k=>`<option value="${k}">${RR[k]}</option>`).join('')}</select></div></div><label>المميزات (سطر لكل ميزة)</label><textarea id="pd" rows="3"></textarea><button onclick="addPk()">إضافة حزمة</button></div>`+th(['الحزمة','الندرة','نقدي','عملات',''])+db.packages.map(p=>`<tr><td>${E(p.name)}</td><td>${RR[p.rar]}</td><td>${E(p.price)}</td><td>${p.coins}</td><td><button class="del" onclick="delPk(${p.id})">حذف</button></td></tr>`).join('')+'</table></div>';
 if(tab=='ky')b=`<div class="card" style="margin-bottom:16px"><div class="row"><div><label>الحزمة</label><select id="kp">${db.packages.map(p=>`<option value="${p.id}">${E(p.name)}</option>`).join('')}</select></div><div><label>العدد (1-50)</label><input id="kn" type="number" value="1" min="1" max="50"></div></div><button onclick="genKeys()">🔑 توليد مفاتيح</button></div>`+th(['المفتاح','الحزمة','الحالة',''])+[...db.keys].reverse().map(k=>`<tr><td><code>${k.k}</code></td><td>${E((db.packages.find(p=>p.id==k.pid)||{name:'محذوفة'}).name)}</td><td>${k.used?`<span class="tag t2">${E(k.used)}</span>`:'<span class="tag t1">متاح</span>'}</td><td><button class="sec" onclick="cop('${k.k}')">نسخ</button> <button class="del" onclick="delKey('${k.k}')">حذف</button></td></tr>`).join('')+'</table></div>';
 if(tab=='cp')b=`<div class="card" style="margin-bottom:16px"><div class="row"><div><label>الكود</label><input id="cn" style="direction:ltr"></div><div><label>الخصم %</label><input id="cx" type="number" value="10"></div><div><label>عدد الاستخدامات</label><input id="cl" type="number" value="50"></div></div><button onclick="addCp()">إضافة كوبون</button></div>`+th(['الكود','الخصم','المتبقي',''])+db.coupons.map((c,i)=>`<tr><td><code>${E(c.c)}</code></td><td>${c.pct}%</td><td>${c.left}</td><td><button class="del" onclick="adm('cp-del',{i:${i}})">حذف</button></td></tr>`).join('')+'</table></div>';
 if(tab=='nw')b=`<div class="card" style="margin-bottom:16px"><label>العنوان</label><input id="nt"><label>النص</label><textarea id="nb" rows="3"></textarea><button onclick="addNw()">نشر الخبر</button></div>`+th(['الخبر',''])+db.news.map((n,i)=>`<tr><td>${E(n.t)}</td><td><button class="del" onclick="adm('nw-del',{id:${n.id}})">حذف</button></td></tr>`).join('')+'</table></div>';
 if(tab=='us')b=th(['العضو','الدور','المستوى','🪙',''])+db.users.map((u,i)=>`<tr><td>${E(u.u)}${u.ban?' 🚫':''}</td><td>${u.role=='admin'?'أدمن':'عضو'}</td><td>${lvl(u)}</td><td>${u.coins}</td><td>${u.u==me.u?'':`<button class="sec" onclick="give('${u.u}')">+🪙</button> <button class="sec" onclick="adm('user-role',{u:'${u.u}'})">رتبة</button> <button class="sec" onclick="adm('user-ban',{u:'${u.u}'})">حظر</button> <button class="del" onclick="delUser('${u.u}')">حذف</button>`}</td></tr>`).join('')+'</table></div>';
 if(tab=='se'){const s=db.settings;b=`<div class="card"><label>اسم السيرفر</label><input id="sn" value="${E(s.name)}"><div class="row"><div><label>كود cfx.re/join/</label><input id="sc" value="${E(s.cfx)}" style="direction:ltr"></div><div><label>عدد الخانات</label><input id="sl" type="number" value="${s.slots}"></div></div><label>رابط الديسكورد</label><input id="sd" value="${E(s.discord)}" style="direction:ltr"><label>وصف السيرفر</label><textarea id="sx" rows="2">${E(s.desc)}</textarea><label>القوانين (سطر لكل قانون)</label><textarea id="sr" rows="6">${E(s.rules)}</textarea><button onclick="saveSet()">حفظ الإعدادات</button><hr style="border:0;border-top:1px solid var(--ln);margin:18px 0"><label>كلمة مرور جديدة لحسابك</label><input id="np" type="password"><button class="sec" onclick="chPw()">تغيير</button></div>`}
 return`<div class="w"><h2>⚙️ لوحة الإدارة</h2><div class="tabs">${T.map(([k,v])=>`<button class="${tab==k?'':'sec'}" onclick="tab='${k}';render()">${v}</button>`).join('')}</div>${b}</div>`}

// ====== الاتصال بالخادم (server.js) ======
// إذا رفعت الواجهة على GitHub Pages والخادم على استضافة أخرى، ضع رابط الخادم هنا، مثال: 'https://my-site.onrender.com'
const API_URL='';
let token='';try{token=localStorage.getItem('fv_token')||''}catch(e){}
db={settings:{name:'سيرفر فايف ام',cfx:'',discord:'#',slots:128,desc:'',rules:''},packages:[],news:[],users:[],keys:[],coupons:[],stats:{users:0,keysUsed:0}};
async function api(path,body){try{const r=await fetch(API_URL+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:body===undefined?undefined:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok){toast(d.error||'حدث خطأ');return null}return d}catch(e){toast('تعذر الاتصال بالخادم ⚠️');return null}}
async function load(){const d=await api('state');if(d){db=d.db;me=d.me}}
async function act(path,body,msg){const d=await api(path,body);if(!d)return null;await load();if(msg)toast(msg);render();return d}
const adm=(a,b,m)=>act('admin/'+a,b||{},m||'تم ✅');
async function doLogin(){const d=await api('login',{u:$('#u').value.trim(),p:$('#p').value});if(!d)return;token=d.token;try{localStorage.setItem('fv_token',token)}catch(e){}await load();toast('أهلاً '+me.u);go(me.role=='admin'?'admin':'account')}
async function doReg(){if($('#p').value!=$('#p2').value)return toast('كلمتا المرور غير متطابقتين');if(await api('register',{u:$('#u').value.trim(),p:$('#p').value})){toast('تم إنشاء الحساب، سجّل دخولك');go('login')}}
async function out(){await api('logout',{});token='';try{localStorage.removeItem('fv_token')}catch(e){}me=null;await load();go('home')}
async function useCp(){const d=await api('coupon',{code:$('#cc').value.trim()});if(d){cpn=d;toast('تم تفعيل الخصم 🎉');render()}}
async function buy(id){if(!me){toast('سجّل دخولك أولاً');return go('login')}const p=db.packages.find(x=>x.id==id);if(!confirm('شراء '+p.name+'؟'))return;if(await act('buy',{id,coupon:cpn&&cpn.c},'تم الشراء بنجاح 🎉')){cpn=null;render()}}
const daily=()=>act('daily',{},'🔥 تم استلام المكافأة');
async function spin(){const d=await api('spin',{});if(!d)return;wr+=2160+((360-(d.i*45+22.5)-wr%360)+360)%360;$('#wd').style.transform=`rotate(${wr}deg)`;setTimeout(async()=>{await load();toast(`🎉 ربحت ${d.prize} عملة!`);render()},4700)}
const redeem=()=>act('redeem',{k:$('#rk').value.trim()},'تم تفعيل الحزمة ✅');
const addPk=()=>adm('pk-add',{name:$('#pn').value,price:$('#pp').value,coins:+$('#pc').value,rar:$('#pr').value,perks:$('#pd').value});
const delPk=id=>confirm('حذف الحزمة؟')&&adm('pk-del',{id});
const genKeys=()=>adm('keys-gen',{pid:+$('#kp').value,n:+$('#kn').value},'تم توليد المفاتيح 🔑');
const delKey=k=>adm('key-del',{k});
const addCp=()=>adm('cp-add',{c:$('#cn').value,pct:+$('#cx').value,left:+$('#cl').value});
const addNw=()=>adm('nw-add',{t:$('#nt').value,b:$('#nb').value},'تم النشر');
const give=u=>{const n=+prompt('عدد العملات؟');if(n)adm('user-give',{u,n})};
const delUser=u=>confirm('حذف العضو؟')&&adm('user-del',{u});
const saveSet=()=>adm('settings',{name:$('#sn').value,cfx:$('#sc').value,slots:+$('#sl').value,discord:$('#sd').value,desc:$('#sx').value,rules:$('#sr').value},'تم الحفظ');
const chPw=()=>api('password',{p:$('#np').value}).then(d=>d&&toast('تم تغيير كلمة المرور'));
async function init(){try{theme(localStorage.getItem('fv2t')||'p')}catch(e){}await load();ol=Math.round(db.settings.slots*.6);fx();render();
 setInterval(()=>{ol=Math.max(3,Math.min(db.settings.slots,ol+Math.round((Math.random()-.5)*6)));const e=$('#on');if(e)e.textContent=ol},3000)}
init();
