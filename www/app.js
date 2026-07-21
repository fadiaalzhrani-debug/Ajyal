/* ===================== حي أجيال — سكربت مشترك ===================== */

/* ====== إعدادات الحي — عدّليها من هنا ======
   • HAYNA_ORDER_NUMBER: رقم واتساب استقبال الطلبات والتوصيل (صيغة دولية بدون +)، مثال: "9665xxxxxxx".
     - فاضي  = الطلب يُحفظ ويطلع تأكيد فقط (وضع تجريبي).
     - فيه رقم = كل طلب يفتح رسالة واتساب جاهزة تنرسل للرقم (طلبات حقيقية). */
const HAYNA_ORDER_NUMBER = "";

/* ====== قاعدة بيانات الحي (Supabase) ======
   بعد إنشاء مشروع Supabase (اتبعي ملف supabase-setup.md)، ضعي الرابط والمفتاح هنا:
   فاضي = وضع تجريبي (الطلبات تُحفظ محليًا على الجهاز فقط).
   مع المفاتيح = الطلبات والتسجيلات تُحفظ في السحابة وتوصل للوحة التحكم من أي جهاز. */
const AJYAL_SUPABASE = { url: "https://wxugvuewxktendjjlumn.supabase.co", key: "sb_publishable_vWbjfQPTAiX7mOHOCtuqEw_Ka4AUiw3" };
window.AjyalCloud = { enabled:false, insert:async()=>{}, list:async()=>null };
(async function initCloud(){
  if(!AJYAL_SUPABASE.url || !AJYAL_SUPABASE.key) return;
  try{
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const sb = createClient(AJYAL_SUPABASE.url, AJYAL_SUPABASE.key);
    window.AjyalCloud = {
      enabled:true,
      insert:async(t,r)=>{ try{ await sb.from(t).insert(r); }catch(e){} },
      list:async(t)=>{ try{ const {data,error}=await sb.from(t).select('*').order('created_at',{ascending:false}); if(error) return null; return data||[]; }catch(e){ return null; } },
      remove:async(t,id)=>{ try{ const {error}=await sb.from(t).delete().eq('id',id); return !error; }catch(e){ return false; } },
      /* تسجيل دخول لوحة التحكم — الطلبات والتسجيلات ما تُقرأ إلا بحساب */
      signIn:async(email,password)=>{
        try{ const {error}=await sb.auth.signInWithPassword({email,password});
          return error ? {ok:false,msg:error.message} : {ok:true}; }
        catch(e){ return {ok:false,msg:'تعذّر الاتصال'}; }
      },
      signOut:async()=>{ try{ await sb.auth.signOut(); }catch(e){} },
      user:async()=>{ try{ const {data}=await sb.auth.getSession(); return data && data.session ? data.session.user : null; }catch(e){ return null; } }
    };
    document.dispatchEvent(new Event('ajyal-cloud-ready'));
  }catch(e){}
})();

/* تاريخ اليوم (لأي عنصر فيه id="todayDate") */
(function(){
  const el=document.getElementById('todayDate');
  if(el){ try{ el.textContent =
    new Date().toLocaleDateString('ar-SA-u-nu-latn',{weekday:'long',day:'numeric',month:'long'}); }catch(e){} }
})();

/* ===== حماية: تهريب النصوص قبل عرضها =====
   أي نص يكتبه المستخدم (طلب/إعلان/مناسبة) لازم يمر من esc قبل ما ينحط في الصفحة،
   عشان ما يقدر أحد يحقن سكربت يشتغل عند بقية أهل الحي أو في لوحة التحكم. */
window.esc = function(v){
  return String(v==null ? '' : v)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
};
/* أرقام الجوال: أرقام و + فقط (تمنع الحقن داخل روابط tel: و واتساب) */
window.escPhone = function(v){ return String(v==null ? '' : v).replace(/[^0-9+]/g,'').slice(0,20); };
/* تنظيف المدخلات قبل الحفظ (طبقة ثانية) + حد أقصى للطول */
window.clean = function(v, max){ return String(v==null ? '' : v).replace(/[<>]/g,'').trim().slice(0, max||200); };

/* "قبل ساعتين" تُحسب من التاريخ الفعلي — ما تبقى ثابتة */
window.timeAgo = function(ts){
  const t = Number(ts) || 0; if(!t) return '';
  const s = Math.floor((Date.now() - t)/1000);
  if(s < 120)    return 'الآن';
  if(s < 3600)   return 'قبل ' + Math.floor(s/60) + ' دقيقة';
  if(s < 7200)   return 'قبل ساعة';
  if(s < 86400)  return 'قبل ' + Math.floor(s/3600) + ' ساعات';
  if(s < 172800) return 'أمس';
  if(s < 2592000)return 'قبل ' + Math.floor(s/86400) + ' أيام';
  return 'قبل ' + Math.floor(s/2592000) + ' شهر';
};

/* توست */
let _toT;
function toast(msg){
  let t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('show');
  clearTimeout(_toT);_toT=setTimeout(()=>t.classList.remove('show'),3400);
}

/* ===================== نافذة الطلب / الحجز ===================== */
function _reqCfg(action){
  if(/نادي/.test(action))   return {title:'الانضمام لنادي المشي', sub:'عبّئ البيانات وبنضيفك لمجموعة النادي.', submit:'انضم الآن', noItem:true, extra:'الوقت المفضّل (صباحًا/مساءً)'};
  if(/تبادل/.test(action))  return {title:'الانضمام لتبادل جليسة الأطفال', sub:'عبّئ البيانات وبننسّق بينك وبين الجارات.', submit:'انضم الآن', noItem:true, extra:'أعمار الأطفال'};
  if(/الدورة|الورشة|الحلقة/.test(action)) return {title:'التسجيل في', sub:'عبّئ البيانات لحجز المقعد.', submit:'سجّل الآن', extra:'ملاحظة (اختياري)'};
  if(/انضم/.test(action))    return {title:'الانضمام لحي أجيال', sub:'سجّل بياناتك للانضمام لمنصة الحي.', submit:'انضم الآن', noItem:true, extra:'الحي / الشارع'};
  if(/أسرتك/.test(action))   return {title:'تسجيل أسرة منتجة', sub:'سجّل أسرتك وبنراجع طلبك ونتواصل معك.', submit:'سجّل الأسرة', noItem:true, extra:'نوع المنتجات'};
  if(/توصيل/.test(action))   return {title:'طلب توصيل من', sub:'حدّد طلبك وبيوصلك موصّل من الحي بأسرع وقت.', submit:'أرسل الطلب', extra:'تفاصيل الطلب'};
  if(/حجز|احجز/.test(action))return {title:'حجز', sub:'اختر الوقت المناسب وبنأكّد لك الحجز.', submit:'أرسل طلب الحجز', extra:'الوقت المناسب'};
  if(/حضور/.test(action))    return {title:'تسجيل حضور', sub:'سجّل حضورك في الفعالية.', submit:'سجّل حضوري', extra:'عدد الأشخاص'};
  return {title:'طلب من', sub:'عبّئ بياناتك وبنتواصل معك بأسرع وقت.', submit:'أرسل الطلب', extra:'ملاحظة (اختياري)'};
}
function _ensureModal(){
  let bd=document.getElementById('reqModal'); if(bd) return bd;
  bd=document.createElement('div'); bd.id='reqModal'; bd.className='modal-backdrop';
  bd.innerHTML=
    '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="rqTitle">'
   +'<div class="mhead"><div><h3 id="rqTitle"></h3><p id="rqSub"></p></div>'
   +'<button class="modal-x" type="button" data-close aria-label="إغلاق">✕</button></div>'
   +'<form id="rqForm">'
   +'<div class="field"><label>الاسم</label><input name="name" required placeholder="اكتب اسمك"></div>'
   +'<div class="row2">'
   +'<div class="field"><label>رقم الجوال</label><input name="phone" type="tel" required placeholder="05xxxxxxxx"></div>'
   +'<div class="field"><label id="rqExtraL">ملاحظة</label><input name="extra" placeholder="اختياري"></div>'
   +'</div>'
   +'<button type="submit" class="btn btn-primary" id="rqSubmit">أرسل الطلب</button>'
   +'</form></div>';
  document.body.appendChild(bd);
  bd.addEventListener('click',e=>{ if(e.target===bd||e.target.closest('[data-close]')) _closeModal(); });
  bd.querySelector('#rqForm').addEventListener('submit',e=>{
    e.preventDefault(); const f=e.target;
    const rec={item:clean(bd.dataset.item,120), action:clean(bd.dataset.action,80),
      name:clean(f.name.value,80), phone:escPhone(f.phone.value), extra:clean(f.extra.value,300), ts:Date.now()};
    const key='hayna_requests_v1';
    let all=[]; try{all=JSON.parse(localStorage.getItem(key))||[];}catch(e){}
    all.push(rec); localStorage.setItem(key,JSON.stringify(all));
    window.AjyalCloud.insert('requests', rec);
    _closeModal();
    const num=(HAYNA_ORDER_NUMBER||'').replace(/[^0-9]/g,'');
    if(num){
      const lines=['🟢 طلب جديد من موقع حي أجيال','',
        (rec.action||'طلب')+(rec.item?': '+rec.item:''),
        'الاسم: '+rec.name, 'الجوال: '+rec.phone,
        rec.extra?('التفاصيل: '+rec.extra):''].filter(Boolean);
      window.open('https://wa.me/'+num+'?text='+encodeURIComponent(lines.join('\n')),'_blank');
      toast('✓ يفتح واتساب لإرسال طلبك…');
    } else {
      toast('✓ تم استلام طلبك'+(rec.item?' — '+rec.item:'')+' وبنتواصل معك قريبًا');
    }
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') _closeModal(); });
  return bd;
}
function _closeModal(){ const bd=document.getElementById('reqModal'); if(bd) bd.classList.remove('open'); }
function openRequest(item,action){
  const bd=_ensureModal(), c=_reqCfg(action);
  bd.dataset.item=item||''; bd.dataset.action=action||'';
  bd.querySelector('#rqTitle').textContent = c.noItem ? c.title : (item ? c.title+' «'+item+'»' : c.title);
  bd.querySelector('#rqSub').textContent = c.sub;
  bd.querySelector('#rqSubmit').textContent = c.submit;
  bd.querySelector('#rqExtraL').textContent = c.extra;
  bd.querySelector('#rqForm').reset();
  bd.classList.add('open');
  setTimeout(()=>{ const n=bd.querySelector('input[name=name]'); n&&n.focus(); },60);
}

/* أي زر إجراء (اطلب / احجز / سجّل حضورك …) يفتح نافذة الطلب */
document.addEventListener('click',e=>{
  const b=e.target.closest('button.btn'); if(!b) return;
  if(b.closest('form')||b.closest('#periodTabs')||b.id==='burger'||b.classList.contains('remind-btn')) return;
  e.preventDefault();
  const card=b.closest('.card,.serv,.comp-card');
  const h3=card&&card.querySelector('h3');
  openRequest(h3?h3.textContent.trim():'', b.textContent.trim());
});

/* بحث/فلترة تلقائية في صفحات القوائم */
(function(){
  let list=null, sel=null;
  for(const g of document.querySelectorAll('.grid')){
    if(g.querySelector('.card')){ list=g; sel='.card'; break; }
    if(g.querySelector('.serv')){ list=g; sel='.serv'; break; }
    if(g.querySelector('.news-item')){ list=g; sel='.news-item'; break; }
  }
  if(!list) return;
  const bar=document.createElement('div'); bar.className='searchbar';
  bar.innerHTML='<label class="sb-input"><span aria-hidden="true">🔍</span>'
    +'<input type="search" placeholder="ابحث هنا…" aria-label="بحث"></label>'
    +'<span class="sb-count"></span>';
  list.parentNode.insertBefore(bar,list);
  const nores=document.createElement('div'); nores.className='no-results';
  nores.textContent='ما فيه نتائج مطابقة لبحثك'; nores.style.display='none';
  list.parentNode.insertBefore(nores,list.nextSibling);
  const input=bar.querySelector('input'), count=bar.querySelector('.sb-count');
  function apply(){
    const q=input.value.trim().toLowerCase(); let n=0;
    list.querySelectorAll(sel).forEach(it=>{
      const m=!q||it.textContent.toLowerCase().includes(q);
      it.style.display=m?'':'none'; if(m)n++;
    });
    count.textContent=n.toLocaleString('ar-EG')+' نتيجة';
    nores.style.display=n?'none':'block';
  }
  input.addEventListener('input',apply); apply();
})();

/* ===== ميزة أصلية للتطبيق: تنبيهات محلية (تذكير بالفعاليات) ===== */
window.AjyalNative = (function(){
  const LN = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
  if(LN){ try{ LN.requestPermissions(); }catch(e){} }
  return {
    isApp: !!LN,
    async remind(title, body, when){
      if(!LN){ toast('🔔 سجّلنا تذكيرك بـ«'+title+'»'); return; }
      try{
        const at = (when && when.getTime()>Date.now()) ? when : new Date(Date.now()+8000);
        await LN.schedule({ notifications:[{ id:Math.floor(Math.random()*1e6), title, body, schedule:{ at } }] });
        toast('🔔 بنذكّرك قبل «'+title+'»');
      }catch(e){ toast('🔔 سجّلنا تذكيرك'); }
    }
  };
})();
/* أضِف زر "ذكّرني" على بطاقات الفعاليات — يُستدعى مجددًا بعد تحميل المحتوى من اللوحة */
window.AjyalAddReminders = function(){
  document.querySelectorAll('.card.event').forEach(card=>{
    const body=card.querySelector('.event__body'); if(!body||body.querySelector('.remind-btn')) return;
    const title=((card.querySelector('h3')||{}).textContent||'فعالية الحي').trim();
    let iso = card.dataset.date || '';
    if(!iso){   // بطاقة ثابتة: استخدم الشهر الحالي بدل تاريخ مثبّت
      const day=((card.querySelector('.event__date b')||{}).textContent||'').replace(/[^0-9]/g,'');
      if(day){ const n=new Date();
        iso = n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(day).padStart(2,'0'); }
    }
    const btn=document.createElement('button');
    btn.className='btn btn-ghost remind-btn'; btn.style.marginTop='4px'; btn.textContent='🔔 ذكّرني';
    btn.dataset.title=title; if(iso) btn.dataset.date=iso;
    body.appendChild(btn);
  });
};
window.AjyalAddReminders();
document.addEventListener('click',e=>{
  const b=e.target.closest('.remind-btn'); if(!b) return;
  e.preventDefault();
  let when=null; const d=new Date(b.dataset.date); if(!isNaN(d)) when=new Date(d.getTime()-24*3600*1000);
  window.AjyalNative.remind(b.dataset.title||'فعالية الحي','فعالية قادمة في حي أجيال', when);
});

/* التمرير لقسم الرابط (#news / #comp) — بعض المتصفحات والتطبيق ما تنزل تلقائيًا */
(function(){
  function goHash(){
    const h=location.hash; if(!h || h.length<2) return;
    const el=document.getElementById(decodeURIComponent(h.slice(1))); if(!el) return;
    setTimeout(()=>{
      const top = el.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top, behavior:'instant' });
    }, 80);
  }
  window.addEventListener('load', goHash);
  window.addEventListener('hashchange', goHash);
})();

/* تسجيل الـ Service Worker — يخلي الموقع يشتغل كتطبيق قابل للتثبيت ويعمل offline */
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{ navigator.serviceWorker.register('sw.js').catch(()=>{}); });
}

/* حركة الدخول تُدار بالكامل عبر CSS (class="reveal") — لا حاجة لسكربت. */
