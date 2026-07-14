// ════════════════════════════════════════════════════════════
//  DIGITAL SEVA KENDRA — Advanced CSC Portal
//  Fully Supabase-backed: Services, Applications/Tracker, Notices,
//  Documents, Gallery, Blog/Yojana, Hero/Popup/Ticker/Payment/Contact
//  Full-site multi-language (Hindi / English / Chhattisgarhi) for
//  all static UI text. Admin-entered content (notices, documents,
//  blog, gallery captions) displays in whichever language the admin
//  typed it in — only Service names have an optional English field.
//  Theme (dark/light) + visitor counter are device-local UI state.
// ════════════════════════════════════════════════════════════

// ── Supabase Config ──────────────────────────────────────────
// 👉 SUPABASE_SETUP.md follow करके ये दोनों values भरें
const SUPABASE_URL = "https://bhijcbkilhscmyqfjdwn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoaWpjYmtpbGhzY215cWZqZHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5ODQ1MDUsImV4cCI6MjA5ODU2MDUwNX0.9d2pvzpQTLPEjr_bzzTknusAZG-bYRQpGc1X6u8PBqw";


let sb = null;
let SB_READY = false;
try{
  if(typeof supabase==="undefined") throw new Error("Supabase library load नहीं हो पाई — internet/CDN check करें।");
  if(!SUPABASE_URL || SUPABASE_URL.indexOf("YOUR_SUPABASE")===0 || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.indexOf("YOUR_SUPABASE")===0){
    throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY अभी भी placeholder हैं — SUPABASE_SETUP.md देखें।");
  }
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  SB_READY = true;
}catch(cfgErr){
  console.error("[DSK Supabase Config Error]", cfgErr.message);
  window.addEventListener("DOMContentLoaded",()=>{
    const w=document.getElementById("toast-wrap");
    if(w){
      const el=document.createElement("div");
      el.className="toast err";el.style.pointerEvents="all";
      el.innerHTML=`<span class="toast-msg">⚠️ Backend connect नहीं हुआ: ${cfgErr.message}</span>`;
      w.appendChild(el);
    }
  });
}
function sbOK(){ if(!SB_READY){console.warn("Supabase configured नहीं है।");return false;} return true; }

// ── Helpers ───────────────────────────────────────────────
function escH(s){ return (s==null?"":String(s)).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function esc(s){ return (s==null?"":String(s)).replace(/'/g,"\\'"); }
function toast(msg,type="info",dur=3200){
  const w=document.getElementById("toast-wrap");if(!w)return;
  const el=document.createElement("div");
  el.className="toast "+type;
  el.innerHTML=`<span class="toast-msg">${msg}</span><button class="toast-x" onclick="this.parentElement.remove()">✕</button>`;
  w.appendChild(el);
  setTimeout(()=>el.remove(),dur);
}

// ── State ──────────────────────────────────────────────────
let admSvcs=[], admNtcs=[], admDocs=[], admGal=[], admBlg=[], admTrk=[];
let heroCustomized=false;
let currentLang = localStorage.getItem("dsk_lang") || "hi";

// ════════════════════════════════════════════════════════════
//  i18n — full-site translation dictionary
// ════════════════════════════════════════════════════════════
const LANGS = {
  hi:{
    pop_ttl:"महत्वपूर्ण सूचना", pop_msg:"हमारे केंद्र में आधार, पैन, आयुष्मान कार्ड एवं समस्त सरकारी योजनाओं के आवेदन की सुविधा उपलब्ध है। अपने आवेदन की स्थिति अब ऑनलाइन ट्रैक भी करें।", pop_hl:"🕐 सोमवार – शनिवार: सुबह 9 बजे – शाम 6 बजे | रविवार: 10 बजे – 2 बजे",
    btn_close:"बंद करें", btn_ok:"ठीक है ✓",
    apply_title:"आवेदन करें", apply_msg:"आवेदन के लिए कृपया हमारे केंद्र पर पधारें या नीचे दिए गए विकल्पों का उपयोग करें।",
    apply_process_lbl:"📋 आवेदन प्रक्रिया:", apply_process_txt:"फॉर्म भरना, दस्तावेज सत्यापन एवं आवेदन जमा करने के लिए सीधे केंद्र पर आएं।",
    apply_addr_lbl:"📍 पता:", apply_contact_lbl:"📞 संपर्क:", apply_time_lbl:"⏰ समय:", btn_whatsapp:"💬 WhatsApp करें",
    brand_full:"Sai Grahak Kendra", "brand-tag":"Rahul Sahu — CSC / Digital Seva सेवाएं",
    nav_home:"होम", nav_services:"सेवाएं", nav_tracker:"आवेदन ट्रैक करें", nav_notices:"नोटिस", nav_documents:"दस्तावेज़",
    nav_gallery:"गैलरी", nav_blog:"योजनाएं", nav_location:"स्थान", nav_payment:"भुगतान",
    search_ph:"🔍 सेवा खोजें... आधार, पैन, आयुष्मान...", ticker_lbl:"🔔 सूचना",
    hero_badge:"सरकारी मान्यता प्राप्त केंद्र — डिजिटल सेवा 2.0",
    hero_h2:'आपकी <span class="hl">सरकारी सेवाएं</span><br/>अब ऑनलाइन ट्रैक भी करें',
    hero_p:"आधार, पैन, प्रमाण पत्र एवं सभी सरकारी योजनाओं की सेवाएं एक ही जगह — साथ ही अपने आवेदन की लाइव स्थिति भी देखें।",
    hero_cta1:"सेवाएं देखें", hero_cta2:"आवेदन ट्रैक करें", live_feed_lbl:"लाइव आवेदन अपडेट्स",
    hero_card_sub:"Common Service Centre — Government Authorized", addr_pending:"ग्राम धौर, जिला दुर्ग, छत्तीसगढ़ - 490024", hero_open_now:"🟢 अभी खुला है",
    svc_tag:"⚙️ हमारी सेवाएं", svc_title:"सभी सरकारी सेवाएं एक स्थान पर", svc_sub:"नीचे दी गई किसी भी सेवा के लिए फॉर्म देखें या आवेदन करें।",
    trk_tag:"🔍 आवेदन स्थिति", trk_title:"अपना आवेदन ट्रैक करें", trk_sub:"काउंटर से मिली Tracking ID डालकर अपने आवेदन की वर्तमान स्थिति देखें।",
    trk_ph:"जैसे: DSK2026-00123", trk_btn:"🔍 ट्रैक करें", trk_hint:"💡 Tracking ID आपको आवेदन जमा करते समय केंद्र से दी जाती है।",
    ntc_tag:"📋 सूचना पट्ट", ntc_title:"नोटिस बोर्ड", ntc_sub:"सभी नवीनतम सूचनाएं एवं घोषणाएं यहाँ देखें।", ntc_board_hd:"सरकारी सूचनाएं",
    doc_tag:"📄 दस्तावेज़", doc_title:"फॉर्म एवं दस्तावेज़ डाउनलोड करें", doc_sub:"यहाँ से आवश्यक फॉर्म एवं दस्तावेज़ डाउनलोड करें।", doc_board_hd:"उपलब्ध दस्तावेज़",
    gal_tag:"🖼️ गैलरी", gal_title:"हमारा केंद्र — तस्वीरों में", gal_sub:"हमारे केंद्र, कार्यक्रमों एवं सेवाओं की झलकियाँ।",
    blog_tag:"📰 योजना अपडेट्स", blog_title:"ताज़ा योजनाएं एवं समाचार", blog_sub:"सरकारी योजनाओं, नई सेवाओं एवं केंद्र से जुड़ी खबरें।",
    pay_tag:"💳 ऑनलाइन भुगतान", pay_title:"UPI से भुगतान करें", pay_sub:"सेवा शुल्क का भुगतान UPI या QR कोड के माध्यम से करें।",
    pay_card_ttl:"💳 ऑनलाइन पेमेंट", pay_card_txt:"UPI ID से या QR कोड स्कैन करके भुगतान करें। पेमेंट के बाद स्क्रीनशॉट लेकर आएं।",
    btn_copy:"📋 कॉपी", pay_methods_lbl:"स्वीकृत माध्यम", qr_scan_txt:"QR Code<br/><small>Scan to Pay</small>",
    loc_tag:"📍 हमारा स्थान", loc_title:"हमें यहाँ ढूंढें", loc_vle_lbl:"केंद्र प्रभारी (VLE)", loc_hours_short:"सोम–शनि 9AM–6PM",
    loc_email_lbl:"ईमेल", loc_hours_lbl:"कार्यालय समय", btn_maps:"Google Maps पर देखें", btn_open_map:"नक्शे पर खोलें",
    faq_tag:"❓ सामान्य प्रश्न", faq_title:"अक्सर पूछे जाने वाले प्रश्न", faq_sub:"यहाँ सबसे ज्यादा पूछे जाने वाले प्रश्नों के उत्तर दिए गए हैं।",
    ft_brand_txt:"सरकार द्वारा प्राधिकृत Common Service Centre — डिजिटल इंडिया के साथ आपकी सेवा में।",
    ft_services_hd:"⚙️ सेवाएं", ft_svc1:"▸ आधार अपडेट", ft_svc2:"▸ पैन कार्ड", ft_svc3:"▸ आयुष्मान कार्ड", ft_svc4:"▸ आवेदन ट्रैक करें",
    ft_links_hd:"🔗 त्वरित लिंक", ft_contact_hd:"📞 संपर्क", ft_rights:"All Rights Reserved.",
    cb_name:"Seva Assistant", cb_online:"ऑनलाइन | सेवा में", cb_welcome:"नमस्ते! 🙏 मैं Seva Assistant हूँ। किस सेवा के बारे में जानना है?", cb_ph:"प्रश्न पूछें..."
  },
  en:{
    pop_ttl:"Important Notice", pop_msg:"Our centre provides Aadhaar, PAN, Ayushman Card and all government scheme applications. You can now track your application status online too.", pop_hl:"🕐 Mon – Sat: 9 AM – 6 PM | Sun: 10 AM – 2 PM",
    btn_close:"Close", btn_ok:"OK ✓",
    apply_title:"Apply Now", apply_msg:"Please visit our centre to apply, or use the options below.",
    apply_process_lbl:"📋 Application Process:", apply_process_txt:"Visit the centre directly for form filling, document verification, and submission.",
    apply_addr_lbl:"📍 Address:", apply_contact_lbl:"📞 Contact:", apply_time_lbl:"⏰ Timing:", btn_whatsapp:"💬 WhatsApp Us",
    brand_full:"Sai Grahak Kendra", "brand-tag":"Rahul Sahu — CSC / Digital Seva Services",
    nav_home:"Home", nav_services:"Services", nav_tracker:"Track Application", nav_notices:"Notices", nav_documents:"Documents",
    nav_gallery:"Gallery", nav_blog:"Schemes", nav_location:"Location", nav_payment:"Payment",
    search_ph:"🔍 Search services... Aadhaar, PAN, Ayushman...", ticker_lbl:"🔔 Notice",
    hero_badge:"Government Authorized Centre — Digital Seva 2.0",
    hero_h2:'Your <span class="hl">Government Services</span><br/>Now Track Online Too',
    hero_p:"Aadhaar, PAN, certificates and all government scheme services at one place — plus live tracking of your application status.",
    hero_cta1:"View Services", hero_cta2:"Track Application", live_feed_lbl:"Live Application Updates",
    hero_card_sub:"Common Service Centre — Government Authorized", addr_pending:"Village Dhour, Dist. Durg, Chhattisgarh - 490024", hero_open_now:"🟢 Open Now",
    svc_tag:"⚙️ Our Services", svc_title:"All Government Services In One Place", svc_sub:"View the form or apply for any service listed below.",
    trk_tag:"🔍 Application Status", trk_title:"Track Your Application", trk_sub:"Enter the Tracking ID given at the counter to see your application's current status.",
    trk_ph:"e.g. DSK2026-00123", trk_btn:"🔍 Track", trk_hint:"💡 Your Tracking ID is given by the centre when you submit an application.",
    ntc_tag:"📋 Notice Board", ntc_title:"Notice Board", ntc_sub:"See all the latest notices and announcements here.", ntc_board_hd:"Official Notices",
    doc_tag:"📄 Documents", doc_title:"Download Forms & Documents", doc_sub:"Download required forms and documents here.", doc_board_hd:"Available Documents",
    gal_tag:"🖼️ Gallery", gal_title:"Our Centre — In Pictures", gal_sub:"Glimpses of our centre, events, and services.",
    blog_tag:"📰 Scheme Updates", blog_title:"Latest Schemes & News", blog_sub:"News about government schemes, new services, and our centre.",
    pay_tag:"💳 Online Payment", pay_title:"Pay via UPI", pay_sub:"Pay service charges via UPI or QR code.",
    pay_card_ttl:"💳 Online Payment", pay_card_txt:"Pay using the UPI ID or by scanning the QR code. Bring a screenshot after payment.",
    btn_copy:"📋 Copy", pay_methods_lbl:"Accepted Methods", qr_scan_txt:"QR Code<br/><small>Scan to Pay</small>",
    loc_tag:"📍 Our Location", loc_title:"Find Us Here", loc_vle_lbl:"Centre In-charge (VLE)", loc_hours_short:"Mon–Sat 9AM–6PM",
    loc_email_lbl:"Email", loc_hours_lbl:"Office Hours", btn_maps:"View on Google Maps", btn_open_map:"Open in Maps",
    faq_tag:"❓ FAQ", faq_title:"Frequently Asked Questions", faq_sub:"Answers to the most commonly asked questions.",
    ft_brand_txt:"Government Authorized Common Service Centre — at your service with Digital India.",
    ft_services_hd:"⚙️ Services", ft_svc1:"▸ Aadhaar Update", ft_svc2:"▸ PAN Card", ft_svc3:"▸ Ayushman Card", ft_svc4:"▸ Track Application",
    ft_links_hd:"🔗 Quick Links", ft_contact_hd:"📞 Contact", ft_rights:"All Rights Reserved.",
    cb_name:"Seva Assistant", cb_online:"Online | At your service", cb_welcome:"Hello! 🙏 I'm Seva Assistant. What service would you like to know about?", cb_ph:"Ask a question..."
  },
  cg:{
    pop_ttl:"जरूरी सूचना", pop_msg:"हमर केंद्र मा आधार, पैन, आयुष्मान कार्ड अउ सब सरकारी योजना के आवेदन के सुविधा हे। अपन आवेदन के स्थिति अब ऑनलाइन घलो देखव।", pop_hl:"🕐 सोम – शनि: 9 बजे – 6 बजे | रविवार: 10 बजे – 2 बजे",
    btn_close:"बंद करव", btn_ok:"ठीक हे ✓",
    apply_title:"आवेदन करव", apply_msg:"आवेदन बर हमर केंद्र मा आवव या नीचे दिए विकल्प के उपयोग करव।",
    apply_process_lbl:"📋 आवेदन प्रक्रिया:", apply_process_txt:"फॉर्म भरे, दस्तावेज सत्यापन अउ आवेदन जमा करे बर सीधा केंद्र मा आवव।",
    apply_addr_lbl:"📍 पता:", apply_contact_lbl:"📞 संपर्क:", apply_time_lbl:"⏰ समय:", btn_whatsapp:"💬 WhatsApp करव",
    brand_full:"Sai Grahak Kendra", "brand-tag":"Rahul Sahu — CSC / Digital Seva सेवा",
    nav_home:"होम", nav_services:"सेवा", nav_tracker:"आवेदन ट्रैक करव", nav_notices:"नोटिस", nav_documents:"दस्तावेज़",
    nav_gallery:"गैलरी", nav_blog:"योजना", nav_location:"जगह", nav_payment:"भुगतान",
    search_ph:"🔍 सेवा खोजव... आधार, पैन, आयुष्मान...", ticker_lbl:"🔔 सूचना",
    hero_badge:"सरकारी मान्यता प्राप्त केंद्र — डिजिटल सेवा 2.0",
    hero_h2:'आपकर <span class="hl">सरकारी सेवा</span><br/>अब ऑनलाइन ट्रैक घलो करव',
    hero_p:"आधार, पैन, प्रमाण पत्र अउ सब सरकारी योजना के सेवा एके जगह — अपन आवेदन के लाइव स्थिति घलो देखव।",
    hero_cta1:"सेवा देखव", hero_cta2:"आवेदन ट्रैक करव", live_feed_lbl:"लाइव आवेदन अपडेट",
    hero_card_sub:"Common Service Centre — Government Authorized", addr_pending:"गांव धौर, जिला दुर्ग, छत्तीसगढ़ - 490024", hero_open_now:"🟢 अभी खुला हे",
    svc_tag:"⚙️ हमर सेवा", svc_title:"सब सरकारी सेवा एके जगह मा", svc_sub:"नीचे दिए कोनो सेवा बर फॉर्म देखव या आवेदन करव।",
    trk_tag:"🔍 आवेदन स्थिति", trk_title:"अपन आवेदन ट्रैक करव", trk_sub:"काउंटर ले मिले Tracking ID डाल के अपन आवेदन के स्थिति देखव।",
    trk_ph:"जइसे: DSK2026-00123", trk_btn:"🔍 ट्रैक करव", trk_hint:"💡 Tracking ID आवेदन जमा करत बखत केंद्र ले मिलथे।",
    ntc_tag:"📋 सूचना पट्ट", ntc_title:"नोटिस बोर्ड", ntc_sub:"सब नवा सूचना अउ घोषणा इहाँ देखव।", ntc_board_hd:"सरकारी सूचना",
    doc_tag:"📄 दस्तावेज़", doc_title:"फॉर्म अउ दस्तावेज़ डाउनलोड करव", doc_sub:"इहाँ ले जरूरी फॉर्म अउ दस्तावेज़ डाउनलोड करव।", doc_board_hd:"उपलब्ध दस्तावेज़",
    gal_tag:"🖼️ गैलरी", gal_title:"हमर केंद्र — फोटू मा", gal_sub:"हमर केंद्र, कार्यक्रम अउ सेवा के झलक।",
    blog_tag:"📰 योजना अपडेट", blog_title:"नवा योजना अउ समाचार", blog_sub:"सरकारी योजना, नवा सेवा अउ केंद्र के खबर।",
    pay_tag:"💳 ऑनलाइन भुगतान", pay_title:"UPI ले भुगतान करव", pay_sub:"सेवा शुल्क के भुगतान UPI या QR कोड ले करव।",
    pay_card_ttl:"💳 ऑनलाइन पेमेंट", pay_card_txt:"UPI ID या QR कोड स्कैन करके भुगतान करव। पेमेंट के बाद स्क्रीनशॉट लेके आवव।",
    btn_copy:"📋 कॉपी", pay_methods_lbl:"स्वीकृत माध्यम", qr_scan_txt:"QR Code<br/><small>Scan to Pay</small>",
    loc_tag:"📍 हमर जगह", loc_title:"हमन ला इहाँ खोजव", loc_vle_lbl:"केंद्र प्रभारी (VLE)", loc_hours_short:"सोम–शनि 9AM–6PM",
    loc_email_lbl:"ईमेल", loc_hours_lbl:"कार्यालय समय", btn_maps:"Google Maps मा देखव", btn_open_map:"नक्शा मा खोलव",
    faq_tag:"❓ आम सवाल", faq_title:"अक्सर पूछे जाने वाला सवाल", faq_sub:"इहाँ सबले जादा पूछे जाने वाला सवाल के जवाब हे।",
    ft_brand_txt:"सरकार ले प्राधिकृत Common Service Centre — डिजिटल इंडिया के संग आपके सेवा मा।",
    ft_services_hd:"⚙️ सेवा", ft_svc1:"▸ आधार अपडेट", ft_svc2:"▸ पैन कार्ड", ft_svc3:"▸ आयुष्मान कार्ड", ft_svc4:"▸ आवेदन ट्रैक करव",
    ft_links_hd:"🔗 त्वरित लिंक", ft_contact_hd:"📞 संपर्क", ft_rights:"सर्वाधिकार सुरक्षित।",
    cb_name:"Seva Assistant", cb_online:"ऑनलाइन | सेवा मा", cb_welcome:"नमस्ते! 🙏 मंय Seva Assistant अंव। कोन सेवा के बारे मा जानना हे?", cb_ph:"सवाल पूछव..."
  }
};
const HERO_SKIP_IDS=["hero-badge-el","hero-h2-el","hero-p-el","hero-c1-el","hero-c2-el"];

function applyI18n(lang){
  const dict = LANGS[lang] || LANGS.hi;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    if(heroCustomized && HERO_SKIP_IDS.includes(el.id)) return;
    const k=el.getAttribute("data-i18n");
    if(dict[k]!==undefined) el.textContent=dict[k];
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el=>{
    if(heroCustomized && HERO_SKIP_IDS.includes(el.id)) return;
    const k=el.getAttribute("data-i18n-html");
    if(dict[k]!==undefined) el.innerHTML=dict[k];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el=>{
    const k=el.getAttribute("data-i18n-ph");
    if(dict[k]!==undefined) el.placeholder=dict[k];
  });
  document.documentElement.lang = lang==="en"?"en":"hi";
}
function switchLang(l){
  currentLang=l;
  localStorage.setItem("dsk_lang",l);
  document.getElementById("lang-sel").value=l;
  applyI18n(l);
  renderServicesFromCache();
}

// ════════════════════════════════════════════════════════════
//  THEME, MENU, MISC UI
// ════════════════════════════════════════════════════════════
function toggleDark(){
  const html=document.documentElement;
  const isDark=html.getAttribute("data-theme")==="dark";
  html.setAttribute("data-theme",isDark?"light":"dark");
  document.getElementById("dark-btn").textContent=isDark?"🌙":"☀️";
  localStorage.setItem("dsk_theme",isDark?"light":"dark");
}
function toggleMenu(){document.getElementById("mob-menu").classList.toggle("open");}
function closeMenu(){document.getElementById("mob-menu").classList.remove("open");}
function closePopup(){const p=document.getElementById("popup-ov");if(p)p.classList.remove("show");}
function closeApplyModal(){document.getElementById("apply-ov").classList.remove("show");}
function toggleCB(){document.getElementById("cb-box").classList.toggle("show");}
function copyUPI(){
  const t=document.getElementById("upi-el").textContent;
  navigator.clipboard.writeText(t).then(()=>toast("UPI ID कॉपी हो गई! 📋","ok")).catch(()=>toast("Copy नहीं हो पाया","err"));
}
window.addEventListener("scroll",()=>{
  const btn=document.getElementById("top-btn");
  if(btn)btn.classList.toggle("show",window.scrollY>400);
  const nav=document.getElementById("navbar");
  // subtle shrink not required; kept simple
});

// Scroll reveal
function initReveal(){
  const els=document.querySelectorAll(".reveal");
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  },{threshold:.12});
  els.forEach(el=>io.observe(el));
}

// ════════════════════════════════════════════════════════════
//  SERVICES (public + admin) — Supabase-backed
// ════════════════════════════════════════════════════════════
async function loadServices(){
  const grid=document.getElementById("svc-grid");if(!grid)return;
  if(!sbOK()){grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted)">⚠️ Backend connect नहीं हुआ।</div>`;return;}
  const {data,error}=await sb.from("services").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted)">⚠️ Services लोड नहीं हो पाईं।</div>`;console.error(error);return;}
  admSvcs=(data||[]).map(s=>({id:s.id,ic:s.icon||"📋",nm:s.name,nmEn:s.name_en||"",dsc:s.description||"",doc:s.doc_required||"",cat:s.category||"",formFile:s.form_file_url||"",formPath:s.form_file_path||""}));
  renderSvcFilters();
  renderServicesFromCache();
}
let activeSvcCategory="__all__";
function renderSvcFilters(){
  const wrap=document.getElementById("svc-filters");if(!wrap)return;
  const cats=[...new Set(admSvcs.map(s=>s.cat).filter(Boolean))];
  if(!cats.length){wrap.innerHTML="";return;}
  const allLabel = currentLang==="en" ? "All" : "सभी";
  const chips=[{key:"__all__",label:allLabel}, ...cats.map(c=>({key:c,label:c}))];
  wrap.innerHTML=chips.map(c=>`<button class="svc-chip ${activeSvcCategory===c.key?'active':''}" onclick="filterSvcCategory('${esc(c.key)}')">${escH(c.label)}</button>`).join("");
}
function filterSvcCategory(cat){
  activeSvcCategory=cat;
  renderSvcFilters();
  renderServicesFromCache();
}
function renderServicesFromCache(){
  const grid=document.getElementById("svc-grid");if(!grid)return;
  if(!admSvcs.length){
    grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted)"><div style="font-size:3rem;margin-bottom:12px">😔</div><div style="font-weight:700">कोई सेवा नहीं मिली।</div></div>`;
    return;
  }
  const list = activeSvcCategory==="__all__" ? admSvcs : admSvcs.filter(s=>s.cat===activeSvcCategory);
  if(!list.length){
    grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted)">इस category में कोई सेवा नहीं मिली।</div>`;
    return;
  }
  grid.innerHTML=list.map((s,i)=>{
    const displayName=(currentLang==="en" && s.nmEn) ? s.nmEn : s.nm;
    return `
    <div class="svc-card reveal in" style="animation-delay:${i*0.04}s">
      <div class="svc-top"><span class="svc-ic">${escH(s.ic)}</span><h3>${escH(displayName)}</h3></div>
      <div class="svc-bd">
        ${s.cat?`<div class="svc-cat-eyebrow">${escH(s.cat)}</div>`:""}
        <p>${escH(s.dsc)}</p>
        <div class="svc-tags"><span class="svc-tag">📋 ${escH(s.doc)}</span></div>
        <div class="svc-btns">
          <a href="${s.formFile||'#'}" target="${s.formFile?'_blank':'_self'}" class="btn-vf" onclick="viewForm(event,'${esc(s.nm)}')">📄 View Form</a>
          <button class="btn-ap" onclick="showApplyModal('${esc(s.nm)}')">✅ Apply Now</button>
        </div>
      </div>
    </div>`;
  }).join("");
}
function viewForm(e,nm){
  const s=admSvcs.find(x=>x.nm===nm);
  if(!s||!s.formFile){ e.preventDefault(); toast("इस सेवा के लिए अभी कोई फॉर्म उपलब्ध नहीं है।","warn"); }
}
function searchSvc(q){
  const res=document.getElementById("srch-res");
  if(!q||!q.trim()){res.style.display="none";res.innerHTML="";return;}
  const ql=q.toLowerCase();
  const matches=admSvcs.filter(s=>s.nm.toLowerCase().includes(ql)||(s.nmEn||"").toLowerCase().includes(ql)||s.dsc.toLowerCase().includes(ql));
  if(!matches.length){res.innerHTML=`<div class="res-item">कोई सेवा नहीं मिली</div>`;res.style.display="block";return;}
  res.innerHTML=matches.slice(0,6).map(s=>`<div class="res-item" onclick="document.getElementById('services').scrollIntoView({behavior:'smooth'});document.getElementById('srch-res').style.display='none'"><span>${escH(s.ic)}</span><span>${escH(s.nm)}</span></div>`).join("");
  res.style.display="block";
}

// ════════════════════════════════════════════════════════════
//  APPLICATION TRACKER (public + admin)
// ════════════════════════════════════════════════════════════
const STATUS_META={
  received:{label_hi:"प्राप्त हुआ",label_en:"Received",cls:"received",step:0},
  processing:{label_hi:"प्रक्रिया में",label_en:"Processing",cls:"processing",step:1},
  approved:{label_hi:"स्वीकृत",label_en:"Approved",cls:"approved",step:2},
  rejected:{label_hi:"अस्वीकृत",label_en:"Rejected",cls:"rejected",step:-1},
  ready:{label_hi:"संग्रह हेतु तैयार",label_en:"Ready for Collection",cls:"ready",step:3}
};
async function trackApplication(){
  const inp=document.getElementById("trk-inp");
  const id=(inp.value||"").trim();
  const resultEl=document.getElementById("trk-result");
  if(!id){toast("कृपया Tracking ID डालें","warn");return;}
  if(!sbOK()){resultEl.innerHTML=`<p class="trk-empty">⚠️ Backend connect नहीं हुआ।</p>`;resultEl.classList.add("show");return;}
  // Secure RPC — applications टेबल पर direct public SELECT नहीं है (RLS से बंद),
  // यह function सिर्फ exact tracking_id मैच वाली एक row लौटाता है
  const {data,error}=await sb.rpc("get_application_status",{p_tracking_id:id});
  const row=Array.isArray(data)?data[0]:data;
  if(error||!row){
    resultEl.innerHTML=`<div style="text-align:center;padding:20px"><div style="font-size:2.2rem;margin-bottom:10px">🔍</div><p style="color:var(--muted)">इस Tracking ID से कोई आवेदन नहीं मिला। कृपया ID जांच कर पुनः प्रयास करें।</p></div>`;
    resultEl.classList.add("show");
    return;
  }
  const meta=STATUS_META[row.status]||STATUS_META.received;
  const steps=["received","processing","approved","ready"];
  let stepsHtml="";
  if(row.status==="rejected"){
    stepsHtml=`<div class="trk-remarks" style="background:#FBDADD;color:#8C1823">❌ यह आवेदन अस्वीकृत कर दिया गया है। कारण के लिए केंद्र से संपर्क करें।</div>`;
  } else {
    stepsHtml=`<div class="trk-steps">`+steps.map((s,i)=>{
      const m=STATUS_META[s];
      const cls = i<meta.step ? "done" : (i===meta.step ? "active" : "");
      const icon = i<meta.step ? "✓" : (i+1);
      return `<div class="trk-step ${cls}"><div class="trk-step-dot">${icon}</div><span>${m.label_hi}</span></div>`;
    }).join("")+`</div>`;
  }
  resultEl.innerHTML=`
    <div class="trk-r-hd">
      <div><h4>${escH(row.applicant_name||"—")}</h4><small>ID: ${escH(row.tracking_id)} · ${escH(row.service_name||"")}</small></div>
      <span class="trk-status-badge ${meta.cls}">${meta.label_hi}</span>
    </div>
    ${stepsHtml}
    ${row.remarks?`<div class="trk-remarks">📝 ${escH(row.remarks)}</div>`:""}
  `;
  resultEl.classList.add("show");
}
async function loadLiveFeed(){
  const el=document.getElementById("live-feed-list");if(!el)return;
  if(!sbOK())return;
  // Secure RPC — सिर्फ tracking_id/service/status/date लौटाता है, applicant name नहीं (privacy)
  const {data,error}=await sb.rpc("get_recent_applications",{p_limit:6});
  if(error||!data||!data.length){el.innerHTML=`<div class="live-feed-item"><span class="st-dot new"></span> अभी कोई गतिविधि नहीं</div>`;return;}
  const dotCls=s=>s==="approved"||s==="ready"?"done":(s==="processing"?"proc":"new");
  const items=data.map(a=>`<div class="live-feed-item"><span class="st-dot ${dotCls(a.status)}"></span> ${escH(a.tracking_id)} — ${escH((STATUS_META[a.status]||{}).label_hi||a.status)}</div>`).join("");
  el.innerHTML=items+items; // duplicate for seamless scroll loop
}

// Admin — Applications
async function admLoadTrk(){
  if(!sbOK())return;
  const {data,error}=await sb.from("applications").select("*").order("created_at",{ascending:false});
  admTrk=error?[]:(data||[]);
  renderAdmTrk();
}
function renderAdmTrk(){
  const q=(document.getElementById("tr-srch")||{value:""}).value.toLowerCase();
  const el=document.getElementById("adm-trk-list");if(!el)return;
  const list=admTrk.filter(a=>!q||a.tracking_id.toLowerCase().includes(q)||(a.applicant_name||"").toLowerCase().includes(q));
  el.innerHTML=list.length?list.map(a=>{
    const meta=STATUS_META[a.status]||STATUS_META.received;
    return `<div class="adm-li">
      <div class="lco"><div class="lt">${escH(a.tracking_id)} — ${escH(a.applicant_name||"")}</div><div class="ls">${escH(a.service_name||"")} · <span class="trk-status-badge ${meta.cls}" style="padding:2px 8px">${meta.label_hi}</span></div></div>
      <div class="la">
        <button class="adm-btn adm-gh adm-ic-btn" onclick="admEditTrk('${a.id}')" title="Edit">✏️</button>
        <button class="adm-btn adm-del adm-ic-btn" onclick="admDelTrk('${a.id}')" title="Delete">🗑️</button>
      </div>
    </div>`;
  }).join(""):`<div class="adm-empty"><em>📭</em>No applications yet</div>`;
}
async function addApplication(){
  if(!sbOK())return;
  const id=(document.getElementById("tr-id")||{value:""}).value.trim();
  const nm=(document.getElementById("tr-nm")||{value:""}).value.trim();
  const svc=(document.getElementById("tr-svc")||{value:""}).value.trim();
  const st=(document.getElementById("tr-st")||{value:"received"}).value;
  const rmk=(document.getElementById("tr-rmk")||{value:""}).value.trim();
  if(!id||!nm){toast("Tracking ID और Applicant Name जरूरी है!","warn");return;}
  const {error}=await sb.from("applications").insert({tracking_id:id,applicant_name:nm,service_name:svc,status:st,remarks:rmk,updated_at:new Date().toISOString()});
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  await admLoadTrk();updateBadges();admUpdateDash();await loadLiveFeed();
  ["tr-id","tr-nm","tr-svc","tr-rmk"].forEach(i=>{const e=document.getElementById(i);if(e)e.value="";});
  toast("✅ Application record बन गया!","ok");
}
async function admDelTrk(id){
  if(!confirm("यह application record delete करें?"))return;
  const {error}=await sb.from("applications").delete().eq("id",id);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  await admLoadTrk();updateBadges();admUpdateDash();await loadLiveFeed();
  toast("Record delete हो गया।","info");
}
function admEditTrk(id){
  const a=admTrk.find(x=>x.id===id);if(!a)return;
  document.getElementById("edit-ttl").textContent="✏️ Edit Application";
  document.getElementById("edit-bd").innerHTML=`
    <div class="adm-fg"><label>Tracking ID</label><input id="em-trk-id" value="${escH(a.tracking_id)}"/></div>
    <div class="adm-fg"><label>Applicant Name</label><input id="em-trk-nm" value="${escH(a.applicant_name||"")}"/></div>
    <div class="adm-fg"><label>Service Name</label><input id="em-trk-svc" value="${escH(a.service_name||"")}"/></div>
    <div class="adm-fg"><label>Status</label>
      <select id="em-trk-st">
        <option value="received" ${a.status==="received"?"selected":""}>🔵 Received</option>
        <option value="processing" ${a.status==="processing"?"selected":""}>🟡 Processing</option>
        <option value="approved" ${a.status==="approved"?"selected":""}>🟢 Approved</option>
        <option value="rejected" ${a.status==="rejected"?"selected":""}>🔴 Rejected</option>
        <option value="ready" ${a.status==="ready"?"selected":""}>✅ Ready for Collection</option>
      </select>
    </div>
    <div class="adm-fg"><label>Remarks</label><textarea id="em-trk-rmk" rows="2">${escH(a.remarks||"")}</textarea></div>`;
  document.getElementById("edit-ov").classList.add("open");
  document.getElementById("edit-ov").dataset.editId=id;
  document.getElementById("edit-ov").dataset.editType="trk";
}

// ════════════════════════════════════════════════════════════
//  NOTICES (public + admin)
// ════════════════════════════════════════════════════════════
async function loadNotices(){
  const el=document.getElementById("ntc-list");if(!el)return;
  if(!sbOK()){el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--muted)">⚠️ Backend connect नहीं हुआ।</div>`;return;}
  const {data,error}=await sb.from("notices").select("*").eq("is_active",true).order("created_at",{ascending:false});
  if(error){el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--muted)">⚠️ सूचनाएं लोड नहीं हो पाईं।</div>`;return;}
  const now=Date.now();
  el.innerHTML=(data&&data.length)?data.map(n=>{
    const isNew=n.created_at&&(now-new Date(n.created_at).getTime())<5*24*60*60*1000;
    return `<div class="ntc-item">${isNew?'<span class="ntc-new">NEW</span>':""}<div class="ntc-txt"><h4>${escH(n.title)}</h4><p>${escH(n.message||"")}</p><div class="ntc-dt">📅 ${escH(n.date||"")}</div></div></div>`;
  }).join(""):`<div style="text-align:center;padding:30px;color:var(--muted)">📭 कोई सूचना नहीं।</div>`;
}
async function admLoadNtcs(){
  if(!sbOK())return;
  const {data,error}=await sb.from("notices").select("*").order("created_at",{ascending:false});
  admNtcs=error?[]:(data||[]);
  renderAdmNtc();
}
function renderAdmNtc(){
  const el=document.getElementById("adm-ntc-list");if(!el)return;
  el.innerHTML=admNtcs.length?admNtcs.map(n=>`
    <div class="adm-li"><div class="lco"><div class="lt">${escH(n.title)} ${n.is_active?"":'<span style="font-size:.6rem;background:var(--muted-2);color:#fff;padding:1px 6px;border-radius:50px">HIDDEN</span>'}</div><div class="ls">📅 ${escH(n.date||"")}</div></div>
    <div class="la"><button class="adm-btn adm-gh adm-ic-btn" onclick="admEditNtc('${n.id}')">✏️</button><button class="adm-btn adm-del adm-ic-btn" onclick="admDelNtc('${n.id}')">🗑️</button></div></div>`).join(""):`<div class="adm-empty"><em>📭</em>No notices</div>`;
}
async function addNotice(){
  if(!sbOK())return;
  const ttl=(document.getElementById("nt-ttl")||{value:""}).value.trim();
  const bdy=(document.getElementById("nt-bdy")||{value:""}).value.trim();
  const dt=(document.getElementById("nt-dt")||{value:""}).value.trim()||new Date().toLocaleDateString("hi-IN");
  const active=(document.getElementById("nt-nw")||{value:"true"}).value==="true";
  if(!ttl){toast("Title जरूरी है!","warn");return;}
  const {error}=await sb.from("notices").insert({title:ttl,message:bdy,date:dt,is_active:active});
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  await admLoadNtcs();updateBadges();await loadNotices();admUpdateDash();
  ["nt-ttl","nt-bdy","nt-dt"].forEach(i=>{const e=document.getElementById(i);if(e)e.value="";});
  toast("✅ Notice जोड़ी गई!","ok");
}
async function admDelNtc(id){
  if(!confirm("Notice delete करें?"))return;
  const {error}=await sb.from("notices").delete().eq("id",id);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  await admLoadNtcs();updateBadges();await loadNotices();admUpdateDash();
  toast("Notice delete हो गई।","info");
}
function admEditNtc(id){
  const n=admNtcs.find(x=>x.id===id);if(!n)return;
  document.getElementById("edit-ttl").textContent="✏️ Edit Notice";
  document.getElementById("edit-bd").innerHTML=`
    <div class="adm-fg"><label>Title</label><input id="em-ttl-n" value="${escH(n.title)}"/></div>
    <div class="adm-fg"><label>Message</label><textarea id="em-dsc-n" rows="4">${escH(n.message||"")}</textarea></div>
    <div class="adm-fg"><label>Date</label><input id="em-dt-n" value="${escH(n.date||"")}"/></div>
    <div class="adm-fg"><label>Active?</label><select id="em-nw-n"><option value="true" ${n.is_active?"selected":""}>✅ Yes</option><option value="false" ${!n.is_active?"selected":""}>❌ No</option></select></div>`;
  document.getElementById("edit-ov").classList.add("open");
  document.getElementById("edit-ov").dataset.editId=id;
  document.getElementById("edit-ov").dataset.editType="ntc";
}

// ════════════════════════════════════════════════════════════
//  DOCUMENTS (public + admin) — Storage bucket: documents
// ════════════════════════════════════════════════════════════
async function loadDocuments(){
  const el=document.getElementById("doc-list");if(!el)return;
  if(!sbOK()){el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--muted)">⚠️ Backend connect नहीं हुआ।</div>`;return;}
  const {data,error}=await sb.from("documents").select("*").order("uploaded_at",{ascending:false});
  if(error){el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--muted)">⚠️ दस्तावेज़ लोड नहीं हो पाए।</div>`;return;}
  el.innerHTML=(data&&data.length)?data.map(d=>`
    <div class="ntc-item"><div class="ntc-txt"><h4>📄 ${escH(d.title)}</h4>${d.category?`<div class="svc-tags" style="margin:4px 0"><span class="svc-tag">${escH(d.category)}</span></div>`:""}<div class="ntc-dt">📅 ${d.uploaded_at?new Date(d.uploaded_at).toLocaleDateString("hi-IN"):""}</div></div>
    <a href="${d.file_url}" target="_blank" rel="noopener" class="btn-dl" style="flex:none;padding:8px 16px;min-height:36px">⬇️ Download</a></div>`).join(""):`<div style="text-align:center;padding:30px;color:var(--muted)">📁 अभी कोई दस्तावेज़ उपलब्ध नहीं।</div>`;
}
async function admLoadDocs(){
  if(!sbOK())return;
  const {data,error}=await sb.from("documents").select("*").order("uploaded_at",{ascending:false});
  admDocs=error?[]:(data||[]);
  renderAdmDoc();
}
function renderAdmDoc(){
  const el=document.getElementById("adm-doc-list");if(!el)return;
  el.innerHTML=admDocs.length?admDocs.map(d=>`
    <div class="adm-li"><div class="lic">📄</div><div class="lco"><div class="lt">${escH(d.title)}</div><div class="ls">${escH(d.category||"—")}</div></div>
    <div class="la"><button class="adm-btn adm-gh adm-ic-btn" onclick="window.open('${d.file_url}','_blank')">👁️</button><button class="adm-btn adm-del adm-ic-btn" onclick="admDelDoc('${d.id}')">🗑️</button></div></div>`).join(""):`<div class="adm-empty"><em>📁</em>No documents</div>`;
}
async function uploadDocument(){
  if(!sbOK())return;
  const ttl=(document.getElementById("dc-ttl")||{value:""}).value.trim();
  const cat=(document.getElementById("dc-cat")||{value:""}).value.trim();
  const fileInput=document.getElementById("dc-file");
  const file=fileInput&&fileInput.files[0];
  if(!ttl){toast("Title जरूरी है!","warn");return;}
  if(!file){toast("File चुनें!","warn");return;}
  toast("⏳ Upload हो रहा है...","info",2500);
  const path=`${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g,"_")}`;
  const {error:upErr}=await sb.storage.from("documents").upload(path,file);
  if(upErr){toast("❌ Upload में समस्या: "+upErr.message,"err");return;}
  const {data:urlData}=sb.storage.from("documents").getPublicUrl(path);
  const {error:insErr}=await sb.from("documents").insert({title:ttl,category:cat,file_url:urlData.publicUrl,file_path:path});
  if(insErr){toast("❌ Save में समस्या: "+insErr.message,"err");return;}
  await admLoadDocs();updateBadges();await loadDocuments();admUpdateDash();
  ["dc-ttl","dc-cat"].forEach(i=>{const e=document.getElementById(i);if(e)e.value="";});
  fileInput.value="";
  toast("✅ Document अपलोड हो गया!","ok");
}
async function admDelDoc(id){
  if(!confirm("यह document delete करें?"))return;
  const doc=admDocs.find(d=>d.id===id);
  const {error}=await sb.from("documents").delete().eq("id",id);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  if(doc&&doc.file_path)await sb.storage.from("documents").remove([doc.file_path]);
  await admLoadDocs();updateBadges();await loadDocuments();admUpdateDash();
  toast("Document delete हो गया।","info");
}

// ════════════════════════════════════════════════════════════
//  GALLERY (public + admin) — Storage bucket: site-assets/gallery
// ════════════════════════════════════════════════════════════
async function loadGallery(){
  const el=document.getElementById("gal-grid");if(!el)return;
  if(!sbOK()){el.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--muted)">⚠️ Backend connect नहीं हुआ।</div>`;return;}
  const {data,error}=await sb.from("gallery").select("*").order("created_at",{ascending:false});
  if(error){el.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--muted)">⚠️ गैलरी लोड नहीं हो पाई।</div>`;return;}
  admGal=data||[];
  el.innerHTML=(data&&data.length)?data.map((g,i)=>`
    <div class="gal-item reveal in" style="animation-delay:${i*0.03}s" onclick="openLightbox('${g.image_url}','${esc(g.caption||"")}')">
      <img src="${g.image_url}" alt="${escH(g.caption||"")}" loading="lazy"/>
      ${g.caption?`<div class="gal-cap">${escH(g.caption)}</div>`:""}
    </div>`).join(""):`<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--muted)">🖼️ अभी कोई फोटो उपलब्ध नहीं।</div>`;
}
function openLightbox(url,cap){
  document.getElementById("gal-lb-img").src=url;
  document.getElementById("gal-lb-cap").textContent=cap;
  document.getElementById("gal-lightbox").classList.add("show");
}
function closeLightbox(){document.getElementById("gal-lightbox").classList.remove("show");}
async function admLoadGal(){
  if(!sbOK())return;
  const {data,error}=await sb.from("gallery").select("*").order("created_at",{ascending:false});
  admGal=error?[]:(data||[]);
  renderAdmGal();
}
function renderAdmGal(){
  const el=document.getElementById("adm-gal-list");if(!el)return;
  el.innerHTML=admGal.length?admGal.map(g=>`
    <div class="adm-li"><div class="lic">🖼️</div><div class="lco"><div class="lt">${escH(g.caption||"(no caption)")}</div></div>
    <div class="la"><button class="adm-btn adm-gh adm-ic-btn" onclick="window.open('${g.image_url}','_blank')">👁️</button><button class="adm-btn adm-del adm-ic-btn" onclick="admDelGal('${g.id}')">🗑️</button></div></div>`).join(""):`<div class="adm-empty"><em>🖼️</em>No photos</div>`;
}
async function uploadGalleryPhoto(){
  if(!sbOK())return;
  const cap=(document.getElementById("gl-cap")||{value:""}).value.trim();
  const fileInput=document.getElementById("gl-file");
  const file=fileInput&&fileInput.files[0];
  if(!file){toast("Photo चुनें!","warn");return;}
  toast("⏳ Upload हो रहा है...","info",2500);
  const path=`gallery/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g,"_")}`;
  const {error:upErr}=await sb.storage.from("site-assets").upload(path,file);
  if(upErr){toast("❌ Upload में समस्या: "+upErr.message,"err");return;}
  const {data:urlData}=sb.storage.from("site-assets").getPublicUrl(path);
  const {error:insErr}=await sb.from("gallery").insert({caption:cap,image_url:urlData.publicUrl,image_path:path});
  if(insErr){toast("❌ Save में समस्या: "+insErr.message,"err");return;}
  await admLoadGal();updateBadges();await loadGallery();admUpdateDash();
  document.getElementById("gl-cap").value="";fileInput.value="";
  toast("✅ Photo अपलोड हो गई!","ok");
}
async function admDelGal(id){
  if(!confirm("यह photo delete करें?"))return;
  const g=admGal.find(x=>x.id===id);
  const {error}=await sb.from("gallery").delete().eq("id",id);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  if(g&&g.image_path)await sb.storage.from("site-assets").remove([g.image_path]);
  await admLoadGal();updateBadges();await loadGallery();admUpdateDash();
  toast("Photo delete हो गई।","info");
}

// ════════════════════════════════════════════════════════════
//  BLOG / YOJANA (public + admin)
// ════════════════════════════════════════════════════════════
let blogCache=[];
async function loadBlog(){
  const el=document.getElementById("blog-grid");if(!el)return;
  if(!sbOK()){el.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--muted)">⚠️ Backend connect नहीं हुआ।</div>`;return;}
  const {data,error}=await sb.from("blog_posts").select("*").eq("is_published",true).order("created_at",{ascending:false});
  if(error){el.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--muted)">⚠️ पोस्ट लोड नहीं हो पाईं।</div>`;return;}
  blogCache=data||[];
  el.innerHTML=(data&&data.length)?data.map(b=>`
    <div class="blog-card" onclick="openBlogModal('${b.id}')">
      <div class="blog-cov">${b.cover_image_url?`<img src="${b.cover_image_url}" alt=""/>`:"📰"}</div>
      <div class="blog-bd">
        <div class="blog-dt">${new Date(b.created_at).toLocaleDateString("hi-IN",{day:"2-digit",month:"short",year:"numeric"})}</div>
        <h4>${escH(b.title)}</h4>
        <p>${escH(b.summary||"")}</p>
        <div class="blog-read">पूरा पढ़ें →</div>
      </div>
    </div>`).join(""):`<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--muted)">📰 अभी कोई पोस्ट उपलब्ध नहीं।</div>`;
}
function openBlogModal(id){
  const b=blogCache.find(x=>x.id===id)||admBlg.find(x=>x.id===id);if(!b)return;
  document.getElementById("blog-modal-cov").innerHTML=b.cover_image_url?`<img src="${b.cover_image_url}" alt=""/>`:"";
  document.getElementById("blog-modal-dt").textContent=new Date(b.created_at).toLocaleDateString("hi-IN",{day:"2-digit",month:"long",year:"numeric"});
  document.getElementById("blog-modal-ttl").textContent=b.title;
  document.getElementById("blog-modal-content").textContent=b.content||"";
  document.getElementById("blog-modal-ov").classList.add("show");
}
function closeBlogModal(){document.getElementById("blog-modal-ov").classList.remove("show");}
async function admLoadBlg(){
  if(!sbOK())return;
  const {data,error}=await sb.from("blog_posts").select("*").order("created_at",{ascending:false});
  admBlg=error?[]:(data||[]);
  renderAdmBlg();
}
function renderAdmBlg(){
  const el=document.getElementById("adm-blg-list");if(!el)return;
  el.innerHTML=admBlg.length?admBlg.map(b=>`
    <div class="adm-li"><div class="lic">📰</div><div class="lco"><div class="lt">${escH(b.title)} ${b.is_published?"":'<span style="font-size:.6rem;background:var(--muted-2);color:#fff;padding:1px 6px;border-radius:50px">DRAFT</span>'}</div></div>
    <div class="la"><button class="adm-btn adm-del adm-ic-btn" onclick="admDelBlg('${b.id}')">🗑️</button></div></div>`).join(""):`<div class="adm-empty"><em>📰</em>No posts</div>`;
}
async function addBlogPost(){
  if(!sbOK())return;
  const ttl=(document.getElementById("bl-ttl")||{value:""}).value.trim();
  const sum=(document.getElementById("bl-sum")||{value:""}).value.trim();
  const cnt=(document.getElementById("bl-cnt")||{value:""}).value.trim();
  const pub=(document.getElementById("bl-pub")||{value:"true"}).value==="true";
  const fileInput=document.getElementById("bl-file");
  const file=fileInput&&fileInput.files[0];
  if(!ttl){toast("Title जरूरी है!","warn");return;}
  let cover_url=null,cover_path=null;
  if(file){
    toast("⏳ Upload हो रहा है...","info",2500);
    const path=`blog/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g,"_")}`;
    const {error:upErr}=await sb.storage.from("site-assets").upload(path,file);
    if(upErr){toast("❌ Cover upload में समस्या: "+upErr.message,"err");return;}
    const {data:urlData}=sb.storage.from("site-assets").getPublicUrl(path);
    cover_url=urlData.publicUrl;cover_path=path;
  }
  const {error}=await sb.from("blog_posts").insert({title:ttl,summary:sum,content:cnt,is_published:pub,cover_image_url:cover_url,cover_image_path:cover_path});
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  await admLoadBlg();updateBadges();await loadBlog();admUpdateDash();
  ["bl-ttl","bl-sum","bl-cnt"].forEach(i=>{const e=document.getElementById(i);if(e)e.value="";});
  if(fileInput)fileInput.value="";
  toast("✅ Post published!","ok");
}
async function admDelBlg(id){
  if(!confirm("यह post delete करें?"))return;
  const b=admBlg.find(x=>x.id===id);
  const {error}=await sb.from("blog_posts").delete().eq("id",id);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  if(b&&b.cover_image_path)await sb.storage.from("site-assets").remove([b.cover_image_path]);
  await admLoadBlg();updateBadges();await loadBlog();admUpdateDash();
  toast("Post delete हो गया।","info");
}

// ════════════════════════════════════════════════════════════
//  SITE CONTENT — Hero / Popup / Ticker / Payment / Contact
// ════════════════════════════════════════════════════════════
async function getContent(key){
  if(!sbOK())return null;
  const {data,error}=await sb.from("site_content").select("value").eq("key",key).maybeSingle();
  if(error){console.error(error);return null;}
  return data?data.value:null;
}
async function setContent(key,value){
  if(!sbOK())return{error:{message:"Backend connect नहीं हुआ"}};
  return await sb.from("site_content").upsert({key,value,updated_at:new Date().toISOString()});
}
function applyHero(hc){
  if(!hc)return;
  heroCustomized=true;
  if(hc.h2){const e=document.getElementById("hero-h2-el");if(e)e.innerHTML=hc.h2;}
  if(hc.p){const e=document.getElementById("hero-p-el");if(e)e.textContent=hc.p;}
  if(hc.c1){const e=document.getElementById("hero-c1-el");if(e)e.textContent=hc.c1;}
  if(hc.c2){const e=document.getElementById("hero-c2-el");if(e)e.textContent=hc.c2;}
  if(hc.badge){const e=document.getElementById("hero-badge-el");if(e)e.textContent=hc.badge;}
  if(hc.video_url){
    const media=document.getElementById("hero-bg-media");
    if(media)media.innerHTML=`<video autoplay muted loop playsinline><source src="${hc.video_url}" type="video/mp4"></video>`;
    const st=document.getElementById("hr-video-status");if(st)st.textContent="Video uploaded ✅";
  }
}
function applyAddress(addr){
  if(!addr)return;
  const el=id=>document.getElementById(id);
  ["loc-addr-main-el","hcard-addr-el","apply-addr-el","pay-addr-el","ft-addr-el","map-h4-el","loc-sub-el"].forEach(id=>{if(el(id))el(id).textContent=addr;});
  if(el("apply-loc-el"))el("apply-loc-el").textContent="Sai Grahak Kendra, "+addr;
  const mapUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
  ["map-link-1","map-link-2"].forEach(id=>{if(el(id))el(id).href=mapUrl;});
}
async function admLoadSettings(){
  if(!sbOK())return;
  const pay=(await getContent("payment"))||{};
  const ct=(await getContent("contact"))||{};
  const hc=(await getContent("hero"))||{};
  const pp=(await getContent("popup"))||{};
  const tk=(await getContent("ticker"))||{};
  const m=[["py-upi",pay.upi_id],["py-nm",pay.center_name],["ct-nm",ct.center_name],["ct-ph",ct.phone],["ct-em",ct.email],["ct-wa",ct.whatsapp],["ct-addr",ct.address],["ct-ot",ct.office_time],
           ["hr-h2",hc.h2],["hr-p",hc.p],["hr-c1",hc.c1],["hr-c2",hc.c2],["hr-bdg",hc.badge],
           ["pp-ttl",pp.ttl],["pp-msg",pp.msg],["pp-hl",pp.hl],["tick-adm",tk.text]];
  m.forEach(([id,v])=>{const e=document.getElementById(id);if(e&&v)e.value=v;});
  const ppEn=document.getElementById("pp-en");if(ppEn&&pp.enabled!==undefined)ppEn.value=String(pp.enabled);
  const qrSt=document.getElementById("qr-status");if(qrSt)qrSt.textContent=pay.qr_url?"QR uploaded ✅":"No QR uploaded yet";
  const vidSt=document.getElementById("hr-video-status");if(vidSt)vidSt.textContent=hc.video_url?"Video uploaded ✅":"No video uploaded — animated background active";
}
async function saveHero(){
  if(!sbOK())return;
  const hc=(await getContent("hero"))||{};
  hc.h2=(document.getElementById("hr-h2")||{value:""}).value.trim()||hc.h2;
  hc.p=(document.getElementById("hr-p")||{value:""}).value.trim()||hc.p;
  hc.c1=(document.getElementById("hr-c1")||{value:""}).value.trim()||hc.c1;
  hc.c2=(document.getElementById("hr-c2")||{value:""}).value.trim()||hc.c2;
  hc.badge=(document.getElementById("hr-bdg")||{value:""}).value.trim()||hc.badge;
  const vf=document.getElementById("hr-video-file");
  if(vf&&vf.files[0]){
    const file=vf.files[0];
    toast("⏳ Video upload हो रहा है (बड़ी file है, समय लग सकता है)...","info",4000);
    const path=`hero/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g,"_")}`;
    const {error:upErr}=await sb.storage.from("site-assets").upload(path,file);
    if(upErr){toast("❌ Video upload में समस्या: "+upErr.message,"err");return;}
    const {data:urlData}=sb.storage.from("site-assets").getPublicUrl(path);
    hc.video_url=urlData.publicUrl;hc.video_path=path;
    vf.value="";
  }
  const {error}=await setContent("hero",hc);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  applyHero(hc);
  toast("Hero Section अपडेट!","ok");
}
async function savePopup(){
  if(!sbOK())return;
  const c={enabled:(document.getElementById("pp-en")||{value:"true"}).value==="true",ttl:(document.getElementById("pp-ttl")||{value:""}).value.trim(),msg:(document.getElementById("pp-msg")||{value:""}).value.trim(),hl:(document.getElementById("pp-hl")||{value:""}).value.trim()};
  const {error}=await setContent("popup",c);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  toast("Popup settings सेव हो गई!","ok");
}
async function saveTicker(){
  if(!sbOK())return;
  const t=(document.getElementById("tick-adm")||{value:""}).value.trim();
  if(!t){toast("खाली नहीं हो सकता!","warn");return;}
  const {error}=await setContent("ticker",{text:t});
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  const el=document.getElementById("tick-el");if(el)el.innerHTML=t;
  toast("Ticker अपडेट!","ok");
}
async function savePayment(){
  if(!sbOK())return;
  const pay=(await getContent("payment"))||{};
  const upi=(document.getElementById("py-upi")||{value:""}).value.trim();
  const nm=(document.getElementById("py-nm")||{value:""}).value.trim();
  if(upi)pay.upi_id=upi;if(nm)pay.center_name=nm;
  const qf=document.getElementById("py-qr-file");
  if(qf&&qf.files[0]){
    const file=qf.files[0];
    const path=`qr/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g,"_")}`;
    toast("⏳ QR upload हो रहा है...","info",2000);
    const {error:upErr}=await sb.storage.from("site-assets").upload(path,file);
    if(upErr){toast("❌ QR upload में समस्या: "+upErr.message,"err");return;}
    const {data:urlData}=sb.storage.from("site-assets").getPublicUrl(path);
    pay.qr_url=urlData.publicUrl;
    const qrBox=document.getElementById("qr-box");
    if(qrBox)qrBox.innerHTML=`<img src="${pay.qr_url}" alt="QR Code"/>`;
    const qrSt=document.getElementById("qr-status");if(qrSt)qrSt.textContent="QR uploaded ✅";
    qf.value="";
  }
  const {error}=await setContent("payment",pay);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  const upiEl=document.getElementById("upi-el");if(upiEl&&pay.upi_id)upiEl.textContent=pay.upi_id;
  const nmEl=document.getElementById("pay-name-el");if(nmEl&&pay.center_name)nmEl.textContent=pay.center_name;
  toast("Payment info सेव हो गई!","ok");
}
async function saveContact(){
  if(!sbOK())return;
  const get=id=>(document.getElementById(id)||{value:""}).value.trim();
  const ct=(await getContent("contact"))||{};
  const fields=[["ct-nm","center_name"],["ct-ph","phone"],["ct-em","email"],["ct-wa","whatsapp"],["ct-addr","address"],["ct-ot","office_time"]];
  fields.forEach(([id,k])=>{const v=get(id);if(v)ct[k]=v;});
  const {error}=await setContent("contact",ct);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  applyContact(ct);
  toast("Contact info सेव हो गई!","ok");
}
function applyContact(ct){
  if(!ct)return;
  const el=id=>document.getElementById(id);
  if(ct.phone){["ct-ph-el"].forEach(id=>{if(el(id))el(id).textContent=ct.phone;});
    ["tel-ft-link","ft-tel"].forEach(id=>{if(el(id))el(id).href="tel:"+ct.phone;});
    if(el("ft-tel"))el("ft-tel").textContent=ct.phone;
    if(el("hcard-phone-el"))el("hcard-phone-el").textContent=ct.phone;
  }
  if(ct.email){if(el("ct-em-el"))el("ct-em-el").textContent=ct.email;
    ["mail-ft-link","ft-mail"].forEach(id=>{if(el(id))el(id).href="mailto:"+ct.email;});
    if(el("ft-mail"))el("ft-mail").textContent=ct.email;
    if(el("hcard-email-el"))el("hcard-email-el").textContent=ct.email;
  }
  if(ct.center_name){if(el("loc-name-el"))el("loc-name-el").textContent=ct.center_name;if(el("hcard-name-el"))el("hcard-name-el").textContent=ct.center_name;if(el("pay-name-el"))el("pay-name-el").textContent=ct.center_name;}
  if(ct.office_time){if(el("ct-hours-el"))el("ct-hours-el").textContent=ct.office_time;}
  if(ct.address)applyAddress(ct.address);
  if(ct.whatsapp){
    const msg=encodeURIComponent("नमस्ते, Sai Grahak Kendra की सेवाओं के बारे में जानकारी चाहिए।");
    const url=`https://wa.me/${ct.whatsapp}?text=${msg}`;
    if(el("wa-btn"))el("wa-btn").href=url;
    if(el("wa-ft-link"))el("wa-ft-link").href=url;
    const waBtn=document.getElementById("apply-wa-btn");
    if(waBtn)waBtn.onclick=()=>{window.open(`https://wa.me/${ct.whatsapp}?text=`+encodeURIComponent("नमस्ते, मुझे "+document.getElementById("apply-svc-name").textContent+" के बारे में जानकारी चाहिए।"),"_blank");closeApplyModal();};
  }
}

// ════════════════════════════════════════════════════════════
//  APPLY MODAL
// ════════════════════════════════════════════════════════════
function showApplyModal(nm){
  document.getElementById("apply-svc-name").textContent=nm;
  document.getElementById("apply-ov").classList.add("show");
}

// ════════════════════════════════════════════════════════════
//  FAQ
// ════════════════════════════════════════════════════════════
const FAQ_DATA=[
  {q:"आवेदन शुल्क क्या है?",a:"सेवा के अनुसार शुल्क अलग-अलग होता है। कृपया केंद्र पर संपर्क करें या Payment सेक्शन देखें।"},
  {q:"मुझे कौन-कौन से दस्तावेज़ लाने होंगे?",a:"प्रत्येक सेवा के लिए आवश्यक दस्तावेज़ Services सेक्शन में दिए गए हैं। सामान्यतः आधार कार्ड, फोटो और संबंधित प्रमाण पत्र चाहिए होते हैं।"},
  {q:"मैं अपने आवेदन की स्थिति कैसे देखूं?",a:"होम पेज पर 'आवेदन ट्रैक करें' सेक्शन में जाकर काउंटर से मिली Tracking ID डालें।"},
  {q:"केंद्र कब खुला रहता है?",a:"सोमवार से शनिवार सुबह 9 बजे से शाम 6 बजे तक, रविवार को सुबह 10 से दोपहर 2 बजे तक।"}
];
function renderFAQ(){
  const el=document.getElementById("faq-list");if(!el)return;
  el.innerHTML=FAQ_DATA.map((f,i)=>`
    <div class="faq-item" id="faq-${i}">
      <div class="faq-q" onclick="toggleFAQ(${i})"><span>${escH(f.q)}</span><span class="fq-ic">+</span></div>
      <div class="faq-a"><div class="faq-a-in">${escH(f.a)}</div></div>
    </div>`).join("");
}
function toggleFAQ(i){document.getElementById("faq-"+i).classList.toggle("open");}

// ════════════════════════════════════════════════════════════
//  CHATBOT (simple keyword-based)
// ════════════════════════════════════════════════════════════
function cbAsk(k){document.getElementById("cb-inp").value=k;cbSend();}
function cbSend(){
  const inp=document.getElementById("cb-inp");
  const msg=inp.value.trim();if(!msg)return;
  const box=document.getElementById("cb-msgs");
  box.insertAdjacentHTML("beforeend",`<div class="cb-msg user"><div class="cb-bub">${escH(msg)}</div></div>`);
  inp.value="";
  let reply="इस बारे में जानकारी के लिए कृपया केंद्र पर संपर्क करें या ऊपर दिए गए सेक्शन देखें।";
  const m=msg.toLowerCase();
  if(m.includes("आधार")||m.includes("aadhaar"))reply="आधार सेवाओं के लिए Services सेक्शन देखें — अपडेट, नामांकन एवं सुधार सभी उपलब्ध हैं।";
  else if(m.includes("ट्रैक")||m.includes("track")||m.includes("status"))reply="अपने आवेदन की स्थिति जानने के लिए 'आवेदन ट्रैक करें' सेक्शन में Tracking ID डालें।";
  else if(m.includes("शुल्क")||m.includes("fee")||m.includes("payment"))reply="शुल्क सेवा अनुसार अलग होता है। Payment सेक्शन में UPI/QR विवरण उपलब्ध है।";
  else if(m.includes("समय")||m.includes("time")||m.includes("timing"))reply="केंद्र सोम–शनि 9AM–6PM एवं रविवार 10AM–2PM खुला रहता है।";
  box.insertAdjacentHTML("beforeend",`<div class="cb-msg bot"><div class="cb-bub">${reply}</div></div>`);
  box.scrollTop=box.scrollHeight;
}

// ════════════════════════════════════════════════════════════
//  ADMIN — Auth, Panel, Tabs, Badges, Dashboard
// ════════════════════════════════════════════════════════════
async function openAdmModal(){
  if(!sbOK()){toast("⚠️ Backend connect नहीं हुआ।","err");return;}
  const {data:{session}}=await sb.auth.getSession();
  if(session){openAdmPanel();return;}
  document.getElementById("adm-modal-ov").classList.add("open");
  setTimeout(()=>document.getElementById("amc-user").focus(),200);
}
function closeAdmModal(){document.getElementById("adm-modal-ov").classList.remove("open");document.getElementById("amc-err").style.display="none";}
async function doLogin(){
  if(!sbOK())return;
  const u=document.getElementById("amc-user").value.trim();
  const p=document.getElementById("amc-pass").value;
  const e=document.getElementById("amc-err");
  const {error}=await sb.auth.signInWithPassword({email:u,password:p});
  if(error){e.style.display="block";e.textContent="❌ गलत Email या Password!";document.getElementById("amc-pass").value="";setTimeout(()=>e.style.display="none",3500);return;}
  e.style.display="none";document.getElementById("amc-user").value="";document.getElementById("amc-pass").value="";
  closeAdmModal();openAdmPanel();
}
async function doLogout(){
  if(!confirm("Logout करें?"))return;
  if(sbOK())await sb.auth.signOut();
  document.getElementById("adm-panel").classList.remove("open");
  document.body.style.overflow="";
  toast("Logout हो गए।","info");
}
async function openAdmPanel(){
  if(!sbOK()){toast("⚠️ Backend connect नहीं हुआ।","err");return;}
  const {data:{session}}=await sb.auth.getSession();
  if(!session){openAdmModal();return;}
  document.getElementById("adm-panel").classList.add("open");
  document.body.style.overflow="hidden";
  await admLoadSvcs();await admLoadTrk();await admLoadNtcs();await admLoadDocs();await admLoadGal();await admLoadBlg();await admLoadSettings();
  admUpdateDash();updateBadges();
}
function switchTab(btn,tabId){
  document.querySelectorAll(".adm-nav").forEach(b=>b.classList.remove("active"));
  if(btn)btn.classList.add("active");
  document.querySelectorAll(".adm-tab").forEach(t=>t.classList.remove("active"));
  const tab=document.getElementById(tabId);if(tab)tab.classList.add("active");
  closeAdmSB();
}
function toggleAdmSB(){document.getElementById("adm-sb").classList.toggle("open");document.getElementById("adm-sb-ov").classList.toggle("show");}
function closeAdmSB(){document.getElementById("adm-sb").classList.remove("open");document.getElementById("adm-sb-ov").classList.remove("show");}
function admUpdateDash(){
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set("ds-sv",admSvcs.length);set("ds-trk",admTrk.length);set("ds-nt",admNtcs.length);set("ds-dc",admDocs.length);
  set("ds-gal",admGal.length);set("ds-blg",admBlg.length);set("ds-vi",parseInt(localStorage.getItem("dsk_vis")||"0"));
  const rl=document.getElementById("dash-ntc");
  if(rl)rl.innerHTML=admNtcs.slice(0,4).map(n=>`<div class="adm-li"><div class="lco"><div class="lt">${escH(n.title)}</div><div class="ls">📅 ${escH(n.date||"")}</div></div></div>`).join("")||'<div class="adm-empty"><em>📭</em>No notices</div>';
}
function updateBadges(){
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set("bdg-svc",admSvcs.length);set("bdg-trk",admTrk.length);set("bdg-ntc",admNtcs.length);set("bdg-doc",admDocs.length);set("bdg-gal",admGal.length);set("bdg-blg",admBlg.length);
}

// ── Services CRUD (admin) ──────────────────────────────────
async function admLoadSvcs(){
  if(!sbOK())return;
  const {data,error}=await sb.from("services").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  admSvcs=error?[]:(data||[]).map(s=>({id:s.id,ic:s.icon||"📋",nm:s.name,nmEn:s.name_en||"",dsc:s.description||"",doc:s.doc_required||"",cat:s.category||"",formFile:s.form_file_url||"",formPath:s.form_file_path||""}));
  renderAdmSvc();
}
function renderAdmSvc(){
  const q=(document.getElementById("sv-srch")||{value:""}).value.toLowerCase();
  const el=document.getElementById("adm-svc-list");if(!el)return;
  const list=admSvcs.filter(s=>!q||s.nm.toLowerCase().includes(q));
  el.innerHTML=list.length?list.map(s=>`
    <div class="adm-li"><div class="lic">${escH(s.ic)}</div><div class="lco"><div class="lt">${escH(s.nm)}</div><div class="ls">${s.cat?escH(s.cat)+" · ":""}📋 ${escH(s.doc)}</div></div>
    <div class="la"><button class="adm-btn adm-gh adm-ic-btn" onclick="admEditSvc('${s.id}')">✏️</button><button class="adm-btn adm-del adm-ic-btn" onclick="admDelSvc('${s.id}')">🗑️</button></div></div>`).join(""):`<div class="adm-empty"><em>📭</em>No services</div>`;
}
async function addService(){
  if(!sbOK())return;
  const nm=(document.getElementById("sv-nm")||{value:""}).value.trim();
  const nmEn=(document.getElementById("sv-nm-en")||{value:""}).value.trim();
  const dsc=(document.getElementById("sv-dsc")||{value:""}).value.trim();
  const ic=(document.getElementById("sv-ic")||{value:"📋"}).value.trim()||"📋";
  const cat=(document.getElementById("sv-cat")||{value:""}).value.trim();
  const doc=(document.getElementById("sv-doc")||{value:""}).value.trim();
  if(!nm){toast("Service name जरूरी है!","warn");return;}
  const {error}=await sb.from("services").insert({icon:ic,name:nm,name_en:nmEn,category:cat,description:dsc,doc_required:doc||"आधार कार्ड"});
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  await admLoadSvcs();updateBadges();await loadServices();admUpdateDash();
  ["sv-nm","sv-nm-en","sv-cat","sv-dsc","sv-ic","sv-doc"].forEach(i=>{const e=document.getElementById(i);if(e)e.value="";});
  toast("✅ Service जोड़ी गई!","ok");
}
async function admDelSvc(id){
  if(!confirm("यह service delete करें?"))return;
  const s=admSvcs.find(x=>x.id===id);
  const {error}=await sb.from("services").delete().eq("id",id);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  if(s&&s.formPath)await sb.storage.from("site-assets").remove([s.formPath]);
  await admLoadSvcs();updateBadges();await loadServices();admUpdateDash();
  toast("Service delete हो गई।","info");
}
function admEditSvc(id){
  const s=admSvcs.find(x=>x.id===id);if(!s)return;
  document.getElementById("edit-ttl").textContent="✏️ Edit Service";
  document.getElementById("edit-bd").innerHTML=`
    <div class="adm-fg"><label>Icon</label><input id="em-ic" value="${escH(s.ic)}" maxlength="4"/></div>
    <div class="adm-fg"><label>Name (Hindi)</label><input id="em-nm" value="${escH(s.nm)}"/></div>
    <div class="adm-fg"><label>Name (English)</label><input id="em-nm-en" value="${escH(s.nmEn)}"/></div>
    <div class="adm-fg"><label>Category</label><input id="em-cat" value="${escH(s.cat)}"/></div>
    <div class="adm-fg"><label>Description</label><textarea id="em-dsc" rows="3">${escH(s.dsc)}</textarea></div>
    <div class="adm-fg"><label>Documents</label><input id="em-doc" value="${escH(s.doc)}"/></div>
    <div class="adm-fg" style="border-top:1.5px solid var(--line);padding-top:13px">
      <label>📄 Upload Form / PDF / Image</label>
      <input type="file" id="em-form-file" accept="image/*,application/pdf" style="padding:8px;border:1.5px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink-text);width:100%;margin-top:4px"/>
      <small style="color:var(--muted);margin-top:5px;display:block">${s.formFile?"✅ File already uploaded — नई file upload करने से replace होगी":"No file uploaded yet"}</small>
    </div>`;
  document.getElementById("edit-ov").classList.add("open");
  document.getElementById("edit-ov").dataset.editId=id;
  document.getElementById("edit-ov").dataset.editType="svc";
}

// ── Edit Modal dispatcher ──────────────────────────────────
function closeEdit(){document.getElementById("edit-ov").classList.remove("open");}
async function saveEdit(){
  const ov=document.getElementById("edit-ov");
  const type=ov.dataset.editType,id=ov.dataset.editId;
  if(type==="svc"){
    const upd={icon:(document.getElementById("em-ic")||{value:"📋"}).value.trim()||"📋",name:(document.getElementById("em-nm")||{value:""}).value.trim(),name_en:(document.getElementById("em-nm-en")||{value:""}).value.trim(),category:(document.getElementById("em-cat")||{value:""}).value.trim(),description:(document.getElementById("em-dsc")||{value:""}).value.trim(),doc_required:(document.getElementById("em-doc")||{value:""}).value.trim()};
    const fileInput=document.getElementById("em-form-file");
    if(fileInput&&fileInput.files[0]){
      const file=fileInput.files[0];
      const path=`services/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g,"_")}`;
      const {error:upErr}=await sb.storage.from("site-assets").upload(path,file);
      if(upErr){toast("❌ File upload में समस्या: "+upErr.message,"err");closeEdit();return;}
      const {data:urlData}=sb.storage.from("site-assets").getPublicUrl(path);
      upd.form_file_url=urlData.publicUrl;upd.form_file_path=path;
    }
    const {error}=await sb.from("services").update(upd).eq("id",id);
    if(error){toast("❌ समस्या: "+error.message,"err");closeEdit();return;}
    await admLoadSvcs();await loadServices();toast("Service अपडेट!","ok");
  } else if(type==="ntc"){
    const upd={title:(document.getElementById("em-ttl-n")||{value:""}).value.trim(),message:(document.getElementById("em-dsc-n")||{value:""}).value.trim(),date:(document.getElementById("em-dt-n")||{value:""}).value.trim(),is_active:(document.getElementById("em-nw-n")||{value:"true"}).value==="true"};
    const {error}=await sb.from("notices").update(upd).eq("id",id);
    if(error){toast("❌ समस्या: "+error.message,"err");closeEdit();return;}
    await admLoadNtcs();await loadNotices();admUpdateDash();toast("Notice अपडेट!","ok");
  } else if(type==="trk"){
    const upd={tracking_id:(document.getElementById("em-trk-id")||{value:""}).value.trim(),applicant_name:(document.getElementById("em-trk-nm")||{value:""}).value.trim(),service_name:(document.getElementById("em-trk-svc")||{value:""}).value.trim(),status:(document.getElementById("em-trk-st")||{value:"received"}).value,remarks:(document.getElementById("em-trk-rmk")||{value:""}).value.trim(),updated_at:new Date().toISOString()};
    const {error}=await sb.from("applications").update(upd).eq("id",id);
    if(error){toast("❌ समस्या: "+error.message,"err");closeEdit();return;}
    await admLoadTrk();admUpdateDash();await loadLiveFeed();toast("Application अपडेट!","ok");
  }
  closeEdit();
}

// ── Settings — change password, export ─────────────────────
async function changePass(){
  if(!sbOK())return;
  const nw=(document.getElementById("sp-new")||{value:""}).value;
  const cnf=(document.getElementById("sp-cnf")||{value:""}).value;
  if(nw.length<6){toast("Password कम से कम 6 characters का होना चाहिए!","warn");return;}
  if(nw!==cnf){toast("Passwords match नहीं!","warn");return;}
  const {error}=await sb.auth.updateUser({password:nw});
  if(error){toast("❌ Password बदलने में समस्या: "+error.message,"err");return;}
  ["sp-new","sp-cnf"].forEach(i=>{const e=document.getElementById(i);if(e)e.value="";});
  toast("✅ Password बदल गया!","ok");
}
function exportData(){
  const d={services:admSvcs,applications:admTrk,notices:admNtcs,documents:admDocs,gallery:admGal,blog:admBlg};
  const b=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="dsk-data.json";a.click();
  toast("Data export हो गया!","ok");
}

// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════
(async function init(){
  // Theme restore
  const savedTheme=localStorage.getItem("dsk_theme");
  if(savedTheme==="dark"){document.documentElement.setAttribute("data-theme","dark");document.getElementById("dark-btn").textContent="☀️";}
  // Language restore
  document.getElementById("lang-sel").value=currentLang;
  applyI18n(currentLang);
  // Visitor counter (local device UI state only)
  try{const v=parseInt(localStorage.getItem("dsk_vis")||"0");localStorage.setItem("dsk_vis",v+1);}catch{}

  renderFAQ();
  initReveal();

  if(!sbOK())return;

  loadServices();
  loadNotices();
  loadDocuments();
  loadGallery();
  loadBlog();
  loadLiveFeed();
  setInterval(loadLiveFeed,45000);

  try{
    const {data,error}=await sb.from("site_content").select("key,value");
    if(error)throw error;
    const cmap={};(data||[]).forEach(r=>cmap[r.key]=r.value);
    if(cmap.hero)applyHero(cmap.hero);
    if(cmap.ticker&&cmap.ticker.text){const el=document.getElementById("tick-el");if(el)el.innerHTML=cmap.ticker.text;}
    if(cmap.payment){
      const pay=cmap.payment;
      if(pay.upi_id){const e=document.getElementById("upi-el");if(e)e.textContent=pay.upi_id;}
      if(pay.center_name){const e=document.getElementById("pay-name-el");if(e)e.textContent=pay.center_name;}
      if(pay.qr_url){const qrBox=document.getElementById("qr-box");if(qrBox)qrBox.innerHTML=`<img src="${pay.qr_url}" alt="QR Code"/>`;}
    }
    if(cmap.contact)applyContact(cmap.contact);
    const pc=cmap.popup;const po=document.getElementById("popup-ov");
    if(pc&&pc.enabled===false){if(po)po.style.display="none";}
    else{
      if(pc&&po){
        if(pc.ttl){const e=document.getElementById("pop-ttl");if(e)e.textContent=pc.ttl;}
        if(pc.msg){const e=document.getElementById("pop-msg");if(e)e.textContent=pc.msg;}
        if(pc.hl){const e=document.getElementById("pop-hl");if(e)e.textContent=pc.hl;}
      }
      setTimeout(()=>{const po=document.getElementById("popup-ov");if(po)po.classList.add("show");},900);
    }
  }catch(err){
    console.error(err);
    setTimeout(()=>{const po=document.getElementById("popup-ov");if(po)po.classList.add("show");},900);
  }
})();
