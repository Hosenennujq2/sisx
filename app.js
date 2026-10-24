// ===== إعدادات =====
const SERVER_CONNECT = 'fivem://connect/127.0.0.1:30120'; // غيّر الـ IP لسيرفرك
const CATS = ['الايديات','الحزم','العصابات','منتجات مميزة'];
const ICON={'الايديات':'🪪','الحزم':'📦','العصابات':'🕶️','منتجات مميزة':'⭐'};
const PAGES = {
  about:['عن السيرفر','اكتب هنا نبذة عن سيرفرك.'],
  events:['الفعاليات','اكتب هنا الفعاليات القادمة.'],
  rules:['القوانين','اكتب هنا قوانين السيرفر.'],
  terms:['الشروط والأحكام','اكتب هنا شروط وأحكام المتجر.']
};
let user=null, products=[];
const $=s=>document.querySelector(s), view=$('#view');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toFixed(2).replace('.',',')+' ₪';
const fmt=t=>new Date(t).toLocaleString('ar');
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const mail=u=>String(u||'').trim().toLowerCase()+'@users.nova.app';
const E=e=>{if(e)throw new Error(e.message)};
async function me(){
  const {data:{session}}=await sb.auth.getSession();if(!session)return null;
  const {data:p}=await sb.from('profiles').select('*').eq('id',session.user.id).single();if(!p)return null;
  const {data:inv}=await sb.from('inventory').select('*').eq('user_id',p.id).order('created_at');
  return {id:p.id,username:p.username,fivemId:p.fivem_id||'',balance:+p.balance,role:p.role,inventory:(inv||[]).map(i=>({product:i.product_name,via:i.via,date:i.created_at}))};
}
async function api(p,b){
  b=b||{};
  switch(p){
    case 'register':{const u=String(b.username||'').trim().toLowerCase();
      if(!/^[a-z0-9_]{3,20}$/.test(u))throw new Error('اسم المستخدم: حروف إنجليزية وأرقام فقط (3-20)');
      if(String(b.password||'').length<6)throw new Error('كلمة السر 6 أحرف على الأقل');
      const {data,error}=await sb.auth.signUp({email:mail(u),password:b.password,options:{data:{username:u,fivem_id:b.fivemId||''}}});
      if(error)throw new Error(/database|already/i.test(error.message)?'الاسم مستخدم':error.message);
      if(!data.session)throw new Error('عطّل Confirm email من إعدادات Supabase');
      await sb.rpc('log_login');return {user:await me()}}
    case 'login':{const {error}=await sb.auth.signInWithPassword({email:mail(b.username),password:b.password||''});
      if(error)throw new Error('بيانات غلط');await sb.rpc('log_login');return {user:await me()}}
    case 'logout':await sb.auth.signOut();return {};
    case 'me':return {user:await me()};
    case 'fivemid':E((await sb.rpc('set_fivem_id',{t:b.fivemId||''})).error);return {user:await me()};
    case 'products':{const {data,error}=await sb.from('products').select('*').order('created_at',{ascending:false});E(error);
      return {products:data.map(x=>({id:x.id,name:x.name,price:+x.price,desc:x.descr,cat:x.cat}))}}
    case 'buy':E((await sb.rpc('buy_product',{pid:b.id})).error);return {user:await me()};
    case 'redeem':{const r=await sb.rpc('redeem_key',{k:b.key||''});E(r.error);return {user:await me(),product:r.data}}
    case 'admin/data':{
      const [u,k,l,inv]=await Promise.all([sb.from('profiles').select('*').order('created_at'),sb.from('gift_keys').select('*').order('created_at'),
        sb.from('login_logs').select('*').order('created_at',{ascending:false}).limit(200),sb.from('inventory').select('user_id')]);
      [u,k,l,inv].forEach(x=>E(x.error));const pr=await api('products');
      return {users:u.data.map(x=>({id:x.id,username:x.username,fivemId:x.fivem_id,balance:+x.balance,role:x.role,inventory:inv.data.filter(i=>i.user_id===x.id)})),
        keys:k.data.map(x=>({code:x.code,product:x.product_name,usedBy:x.used_by_name,created:x.created_at})),products:pr.products,
        log:l.data.map(x=>`${new Date(x.created_at).toISOString()} | ${x.username} | FiveM:${x.fivem_id||'-'}`)}}
    case 'admin/product':E((await sb.from('products').insert({name:b.name,price:+b.price||0,cat:b.cat,descr:b.desc||''})).error);return {};
    case 'admin/product/delete':E((await sb.from('products').delete().eq('id',b.id)).error);return {};
    case 'admin/key':{const r=await sb.rpc('admin_create_keys',{pid:b.pid,qty:+b.qty||1});E(r.error);return {codes:r.data}}
    case 'admin/key/delete':E((await sb.from('gift_keys').delete().eq('code',b.code)).error);return {};
    case 'admin/balance':E((await sb.rpc('admin_add_balance',{uid:b.id,amt:+b.amount||0})).error);return {};
    case 'admin/role':E((await sb.from('profiles').update({role:b.role}).eq('id',b.id)).error);return {};
    case 'admin/give':E((await sb.rpc('admin_give',{uid:b.id,pid:b.pid})).error);return {};
  }
  throw new Error('غير معروف');
}
function exportLog(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+AD.log.join('\n')],{type:'text/plain'}));a.download='logins.txt';a.click()}
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',3000)}
function modal(html){$('#modalBox').innerHTML=html;$('#modal').classList.add('open')}
function closeModal(){$('#modal').classList.remove('open')}
$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};
$('#connectBtn').href=SERVER_CONNECT;

// ===== المستخدم =====
function renderUser(){
  $('#balance').textContent=money(user?user.balance:0);
  $('#adminLink').style.display=user&&user.role==='admin'?'':'none';
  $('#userMenu').innerHTML=user
    ?`<small>مسجل باسم: <b>${esc(user.username)}</b></small><small>ID: ${esc(user.fivemId||'غير محدد')}</small>
      <a class="it" onclick="inventory()">📦 مشترياتي</a><a class="it" onclick="askId()">🆔 تغيير الايدي</a>
      ${user.role==='admin'?'<a class="it" data-go="admin">⚙ لوحة الأدمن</a>':''}
      <a class="it" onclick="logout()">🚪 تسجيل خروج</a>`
    :`<a class="it" onclick="authModal('login')">تسجيل الدخول</a><a class="it" onclick="authModal('register')">إنشاء حساب</a>`;
}
function authModal(mode){
  const reg=mode==='register';
  modal(`<h3>${reg?'إنشاء حساب':'تسجيل الدخول'}</h3>
    <input id="a_u" placeholder="اسم المستخدم"><input id="a_p" type="password" placeholder="كلمة السر">
    ${reg?'<input id="a_id" placeholder="الايدي الخاص فيك (FiveM ID)">':''}
    <button class="btn" onclick="doAuth('${mode}')">${reg?'إنشاء الحساب':'دخول'}</button>
    <a style="color:#999" onclick="authModal('${reg?'login':'register'}')">${reg?'عندك حساب؟ سجّل دخول':'ما عندك حساب؟ أنشئ واحد'}</a>`);
}
async function doAuth(mode){
  try{
    const d=await api(mode,{username:$('#a_u').value,password:$('#a_p').value,fivemId:$('#a_id')?.value});
    user=d.user;renderUser();closeModal();toast('أهلاً '+user.username);
    if(!user.fivemId)askId();route();
  }catch(e){toast(e.message)}
}
function askId(){
  modal(`<h3>حط الايدي الخاص فيك</h3><p>يعطيك العافية بدنا نغلبك حطلنا الايدي تبعك</p>
    <input id="f_id" placeholder="الايدي الخاص فيك" value="${esc(user.fivemId||'')}"><button class="btn" onclick="saveId()">حفظ</button>`);
}
async function saveId(){try{user=(await api('fivemid',{fivemId:$('#f_id').value})).user;renderUser();closeModal();toast('تم الحفظ')}catch(e){toast(e.message)}}
async function logout(){await api('logout',{});user=null;renderUser();go('home');toast('تم تسجيل الخروج')}
$('#userBtn').onclick=e=>{e.stopPropagation();$('#userMenu').classList.toggle('open')};
document.addEventListener('click',()=>$('#userMenu').classList.remove('open'));

// ===== مفاتيحك (تفعيل هدية) =====
$('#keysBtn').onclick=()=>{
  if(!user){toast('سجّل دخول أولاً');return authModal('login')}
  modal(`<h3>🔑 تفعيل مفتاح هدية</h3><p>اكتب المفتاح اللي وصلك لتستلم المنتج</p>
    <input id="k_in" placeholder="XXXX-XXXX-XXXX" style="direction:ltr;text-align:center"><button class="btn" onclick="redeem()">تفعيل</button>`);
};
async function redeem(){
  try{const d=await api('redeem',{key:$('#k_in').value});user=d.user;renderUser();
    modal(`<h3>🎉 مبروك!</h3><p>تم تفعيل المفتاح وربحت: <b>${esc(d.product)}</b></p><button class="btn" onclick="closeModal()">تمام</button>`)}
  catch(e){toast(e.message)}
}
function inventory(){
  modal(`<h3>📦 مشترياتي</h3>${user.inventory.length?`<div class="scroll"><table><tr><th>المنتج</th><th>الطريقة</th><th>التاريخ</th></tr>
    ${user.inventory.map(i=>`<tr><td>${esc(i.product)}</td><td>${esc(i.via)}</td><td>${fmt(i.date)}</td></tr>`).join('')}</table></div>`:'<p>ما عندك مشتريات بعد</p>'}
    <button class="btn dark" onclick="closeModal()">إغلاق</button>`);
}

// ===== التنقل =====
function go(p){location.hash=p}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-go],[data-cat]');if(!a)return;
  if(a.dataset.cat)go('cat/'+a.dataset.cat);else go(a.dataset.go);
});
function card(p){return `<div class="prod"><div class="im">${ICON[p.cat]||'🛒'}</div>
  <div class="bd"><b>${esc(p.name)}</b><span class="c">${esc(p.cat||'')}</span><span class="c">${esc(p.desc)}</span>
  <span class="pr">${money(p.price)}</span><button class="btn" onclick="buy('${p.id}')">شراء</button></div></div>`}
async function buy(id){
  if(!user){toast('سجّل دخول أولاً');return authModal('login')}
  const p=products.find(x=>x.id===id);if(!confirm(`شراء ${p.name} بـ ${money(p.price)}؟`))return;
  try{user=(await api('buy',{id})).user;renderUser();toast('تم الشراء ✅')}catch(e){toast(e.message)}
}
async function route(){
  const h=decodeURIComponent(location.hash.slice(1))||'home';
  document.querySelectorAll('.nav').forEach(n=>n.classList.remove('active'));
  products=(await api('products')).products;
  if(h==='home'){
    view.innerHTML=`<section class="hero"><span class="badge">متجر السيرفر الرسمي</span><h1>ابدأ رحلتك في <em>نوفا سيتي</em></h1>
      <p>رتب، سيارات نادرة، ايديات وحزم حصرية. شراء آمن وسريع، وفعّل هداياك بمفتاح واحد.</p>
      <div class="hero-btns"><a class="btn" data-go="cat/all">تصفح المتجر</a><a class="btn ghost" href="${SERVER_CONNECT}">▶ فوت السيرفر</a></div></section>
      <div class="cats">${CATS.map(c=>`<a class="cat" data-cat="${c}"><i>${ICON[c]}</i><span>${c}</span></a>`).join('')}</div>
      <div class="sec-h"><h2>أحدث المنتجات</h2><a class="btn" data-go="cat/all">عرض الجميع ‹</a></div>
      <div class="grid">${products.slice(0,8).map(card).join('')}</div>`;
  }else if(h.startsWith('cat/')){
    const c=h.slice(4),list=c==='all'?products:products.filter(p=>p.cat===c);
    view.innerHTML=`<div class="sec-h"><h2>${c==='all'?'كل المنتجات':esc(c)}</h2></div><div class="grid">${list.map(card).join('')||'<p>لا توجد منتجات</p>'}</div>`;
  }else if(PAGES[h]){
    view.innerHTML=`<div class="panel"><h2>${PAGES[h][0]}</h2><p class="page">${PAGES[h][1]}</p></div>`;
  }else if(h==='admin'){
    if(!user||user.role!=='admin'){view.innerHTML='<div class="panel">هذه الصفحة للأدمن فقط. سجّل دخول بحساب الأدمن.</div>';return}
    adminView('products');
  }
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);

// ===== لوحة الأدمن =====
let AD=null;
async function adminView(tab){
  AD=await api('admin/data');
  const T={products:'المنتجات',keys:'مفاتيح الهدايا',users:'المستخدمين',log:'سجل الدخول'};
  const tabs=`<div class="tabs">${Object.entries(T).map(([k,v])=>`<button class="btn ${k===tab?'':'dark'}" onclick="adminView('${k}')">${v}</button>`).join('')}</div>`;
  let body='';
  const opts=AD.products.map(p=>`<option value="${p.id}">${esc(p.name)} (${money(p.price)})</option>`).join('');
  if(tab==='products')body=`<div class="panel"><h3>إضافة منتج</h3><div class="row"><input id="n_name" placeholder="الاسم"><input id="n_price" type="number" placeholder="السعر"><select id="n_cat">${CATS.map(c=>`<option>${c}</option>`).join('')}</select></div>
    <div class="row"><input id="n_desc" placeholder="الوصف"></div><button class="btn" onclick="addProduct()">إضافة</button></div>
    <div class="panel scroll"><table><tr><th>المنتج</th><th>القسم</th><th>السعر</th><th></th></tr>${AD.products.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.cat)}</td><td>${money(p.price)}</td><td><button class="btn dark" onclick="adm('product/delete',{id:'${p.id}'},'products')">حذف</button></td></tr>`).join('')}</table></div>`;
  if(tab==='keys')body=`<div class="panel"><h3>🎁 إنشاء مفتاح هدية</h3><div class="row"><select id="g_pid">${opts}</select><input id="g_qty" type="number" min="1" max="50" value="1" placeholder="العدد"></div>
    <button class="btn" onclick="genKey()">إنشاء المفتاح</button><div id="g_out" style="margin-top:12px"></div></div>
    <div class="panel scroll"><table><tr><th>المفتاح</th><th>المنتج</th><th>الحالة</th><th>التاريخ</th><th></th></tr>${AD.keys.slice().reverse().map(k=>`<tr><td><span class="key ${k.usedBy?'used':''}" onclick="navigator.clipboard.writeText('${k.code}');toast('تم النسخ')">${k.code}</span></td><td>${esc(k.product)}</td><td>${k.usedBy?'استخدمه: '+esc(k.usedBy):'🟢 غير مستخدم'}</td><td>${fmt(k.created)}</td><td><button class="btn dark" onclick="adm('key/delete',{code:'${k.code}'},'keys')">حذف</button></td></tr>`).join('')}</table></div>`;
  if(tab==='users')body=`<div class="panel scroll"><table><tr><th>المستخدم</th><th>FiveM ID</th><th>الرصيد</th><th>الصلاحية</th><th>مشتريات</th><th>إجراءات</th></tr>${AD.users.map(u=>`<tr><td>${esc(u.username)}</td><td>${esc(u.fivemId||'-')}</td><td>${money(u.balance)}</td><td>${u.role==='admin'?'أدمن':'عضو'}</td><td>${u.inventory.length}</td>
    <td><button class="btn dark" onclick="addBal('${u.id}')">+ رصيد</button> <button class="btn dark" onclick="adm('role',{id:'${u.id}',role:'${u.role==='admin'?'user':'admin'}'},'users')">${u.role==='admin'?'سحب أدمن':'ترقية أدمن'}</button>
    <select onchange="if(this.value){adm('give',{id:'${u.id}',pid:this.value},'users');}" style="width:auto"><option value="">إعطاء منتج…</option>${opts}</select></td></tr>`).join('')}</table></div>`;
  if(tab==='log')body=`<div class="panel"><h3>سجل تسجيلات الدخول <button class="btn dark" onclick="exportLog()">⬇ تحميل</button></h3><div class="log">${AD.log.map(esc).join('<br>')||'لا يوجد'}</div></div>`;
  view.innerHTML=`<h2 style="margin-bottom:14px">⚙ لوحة الأدمن</h2>${tabs}${body}`;
}
async function adm(p,b,tab){try{await api('admin/'+p,b);toast('تم');adminView(tab)}catch(e){toast(e.message)}}
const addProduct=()=>adm('product',{name:$('#n_name').value,price:$('#n_price').value,cat:$('#n_cat').value,desc:$('#n_desc').value},'products');
const addBal=id=>{const a=prompt('المبلغ؟');if(a)adm('balance',{id,amount:a},'users')};
async function genKey(){
  try{const d=await api('admin/key',{pid:$('#g_pid').value,qty:$('#g_qty').value});
    const codes=d.codes;await adminView('keys');
    $('#g_out').innerHTML='✅ انسخ وأرسل لصاحبك:<br>'+codes.map(c=>`<span class="key" onclick="navigator.clipboard.writeText('${c}');toast('تم النسخ')">${c}</span>`).join(' ');
  }catch(e){toast(e.message)}
}

(async()=>{try{user=(await api('me')).user}catch{}renderUser();route()})();
