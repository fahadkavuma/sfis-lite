import { useState, useMemo } from "react";

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:#f0efe9;font-family:'Source Sans 3',Georgia,serif}
    ::-webkit-scrollbar{width:5px}
    ::-webkit-scrollbar-thumb{background:#c5bfb0;border-radius:3px}
    input:focus,select:focus,textarea:focus{outline:none}
    button{font-family:inherit;cursor:pointer}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .fu{animation:fadeUp .38s ease both}
    .fu1{animation:fadeUp .38s .06s ease both}
    .fu2{animation:fadeUp .38s .12s ease both}
    .fu3{animation:fadeUp .38s .18s ease both}
    .nb:hover{background:rgba(255,255,255,.1)!important}
    .rh:hover{background:#faf9f6!important}
    .gh:hover{background:#dedad2!important}
    @media print{
      body *{visibility:hidden!important}
      #rz,#rz *{visibility:visible!important}
      #rz{position:fixed!important;inset:0!important;display:flex!important;
          align-items:center!important;justify-content:center!important;background:#fff!important}
    }
  `}</style>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const YEARS    = [2025, 2026, 2027];
const CLASSES  = ["S1","S2","S3","S4","S5","S6","P1","P2","P3","P4","P5","P6","P7"];
const PMETHODS = ["Cash","MTN Mobile Money","Airtel Money","Bank Transfer","Cheque"];
const STYPES   = ["Day Scholar","Boarder"];
const DEF_TERM = "Term 1 – 2026";

const ROLES = {
  principal:   { label:"Principal",          color:"#7c3aed", bg:"#ede9fe", short:"PR" },
  headteacher: { label:"Headteacher",         color:"#0369a1", bg:"#e0f2fe", short:"HT" },
  accountant:  { label:"Accountant",          color:"#0f766e", bg:"#ccfbf1", short:"AC" },
  bursar:      { label:"Bursar",              color:"#1a6b3a", bg:"#d6edd9", short:"BR" },
  fees:        { label:"Head of School Fees", color:"#b45309", bg:"#fef3c7", short:"HF" },
};

const CAN = {
  principal:   ["dashboard","students","arrears","notices","exitlog","feestructure","reports","users"],
  headteacher: ["dashboard","arrears","exitlog"],
  accountant:  ["dashboard","students","arrears","reports","feestructure"],
  bursar:      ["students","arrears"],
  fees:        ["students","arrears","notices","exitlog"],
};

const DEMO_USERS = [
  { id:1, username:"principal",   password:"miss2026", role:"principal",   name:"Hajji Ishakka Mbalirwa",     school:"Madinah Islamic Secondary School" },
  { id:2, username:"headteacher", password:"miss2026", role:"headteacher", name:"Ms. Namale Fardah",           school:"Madinah Islamic Secondary School" },
  { id:3, username:"accountant",  password:"miss2026", role:"accountant",  name:"Mr. Ssekandi Robert",         school:"Madinah Islamic Secondary School" },
  { id:4, username:"bursar1",     password:"miss2026", role:"bursar",      name:"Ms. Nakato Susan (Bursar 1)", school:"Madinah Islamic Secondary School" },
  { id:5, username:"bursar2",     password:"miss2026", role:"bursar",      name:"Mr. Kiggundu Ali (Bursar 2)", school:"Madinah Islamic Secondary School" },
  { id:6, username:"fees",        password:"miss2026", role:"fees",        name:"Mr. Tumwesigye David",        school:"Madinah Islamic Secondary School" },
];

// ─── Fee Templates ────────────────────────────────────────────────────────────
const TEMPLATES = {
  "S1-Day Scholar": [{name:"Tuition",amount:300000},{name:"Development",amount:80000},{name:"PTA",amount:30000},{name:"Exam",amount:50000}],
  "S1-Boarder":     [{name:"Tuition",amount:300000},{name:"Boarding",amount:250000},{name:"Feeding",amount:150000},{name:"Development",amount:80000},{name:"PTA",amount:30000}],
  "S2-Day Scholar": [{name:"Tuition",amount:310000},{name:"Development",amount:80000},{name:"PTA",amount:30000},{name:"Exam",amount:50000}],
  "S2-Boarder":     [{name:"Tuition",amount:310000},{name:"Boarding",amount:250000},{name:"Feeding",amount:150000},{name:"Development",amount:80000},{name:"PTA",amount:30000}],
  "S3-Day Scholar": [{name:"Tuition",amount:320000},{name:"Development",amount:80000},{name:"PTA",amount:30000},{name:"Exam",amount:50000}],
  "S3-Boarder":     [{name:"Tuition",amount:320000},{name:"Boarding",amount:260000},{name:"Feeding",amount:150000},{name:"Development",amount:80000},{name:"PTA",amount:30000}],
  "S4-Day Scholar": [{name:"Tuition",amount:340000},{name:"Development",amount:80000},{name:"PTA",amount:30000},{name:"Exam",amount:70000}],
  "S4-Boarder":     [{name:"Tuition",amount:340000},{name:"Boarding",amount:260000},{name:"Feeding",amount:150000},{name:"Development",amount:80000},{name:"PTA",amount:30000},{name:"Exam",amount:70000}],
  "S5-Day Scholar": [{name:"Tuition",amount:360000},{name:"Development",amount:80000},{name:"PTA",amount:30000},{name:"Exam",amount:80000}],
  "S5-Boarder":     [{name:"Tuition",amount:360000},{name:"Boarding",amount:280000},{name:"Feeding",amount:160000},{name:"Development",amount:80000},{name:"PTA",amount:30000},{name:"Exam",amount:80000}],
  "S6-Day Scholar": [{name:"Tuition",amount:380000},{name:"Development",amount:80000},{name:"PTA",amount:30000},{name:"Exam",amount:100000}],
  "S6-Boarder":     [{name:"Tuition",amount:380000},{name:"Boarding",amount:280000},{name:"Feeding",amount:160000},{name:"Development",amount:80000},{name:"PTA",amount:30000},{name:"Exam",amount:100000}],
};

function getTpl(cls, type) { return TEMPLATES[cls + "-" + type] || []; }
function tplTotal(cls, type) { return getTpl(cls,type).reduce((a,c) => a+c.amount, 0); }

// ─── Seed Students ────────────────────────────────────────────────────────────
function mkStudent(id, admNo, name, cls, type, term, phone, clearance, payments) {
  const comps = getTpl(cls, type).map(c => ({...c}));
  const total = comps.reduce((a,c) => a+c.amount, 0);
  const paid  = payments.reduce((a,p) => a+p.amount, 0);
  return { id, admNo, name, cls, type, term, parentPhone:phone, clearance, feeComponents:comps, totalFees:total, amountPaid:paid, payments };
}

const SEED = [
  mkStudent(1,"MISS/001/26","Nakato Amelia",    "S2","Boarder",    DEF_TERM,"0772100001","Cleared",     [{date:"2026-02-10",amount:820000,method:"MTN Mobile Money",ref:"MTN-2601001",rcpt:"MISS-RCP-001",by:"bursar1"}]),
  mkStudent(2,"MISS/002/26","Kato Brian",       "S2","Day Scholar",DEF_TERM,"0752100002","Outstanding", [{date:"2026-02-12",amount:200000,method:"Airtel Money",    ref:"AIR-2601001",rcpt:"MISS-RCP-002",by:"bursar1"}]),
  mkStudent(3,"MISS/003/26","Apio Grace",       "S3","Boarder",    DEF_TERM,"0702100003","Notified",    []),
  mkStudent(4,"MISS/004/26","Mugisha Daniel",   "S4","Day Scholar",DEF_TERM,"0772100004","Cleared",     [{date:"2026-02-08",amount:520000,method:"MTN Mobile Money",ref:"MTN-2601002",rcpt:"MISS-RCP-003",by:"bursar2"}]),
  mkStudent(5,"MISS/005/26","Nabirye Faith",    "S1","Boarder",    DEF_TERM,"0752100005","Outstanding", [{date:"2026-02-15",amount:300000,method:"Cash",            ref:"CASH",       rcpt:"MISS-RCP-004",by:"bursar1"}]),
  mkStudent(6,"MISS/006/26","Ssemakula John",   "S1","Day Scholar",DEF_TERM,"0702100006","Cleared",     [{date:"2026-02-09",amount:460000,method:"Bank Transfer",   ref:"STB-2601001",rcpt:"MISS-RCP-005",by:"bursar2"}]),
  mkStudent(7,"MISS/007/26","Akello Linda",     "S5","Boarder",    DEF_TERM,"0772100007","Outstanding", [{date:"2026-02-20",amount:400000,method:"MTN Mobile Money",ref:"MTN-2601003",rcpt:"MISS-RCP-006",by:"bursar1"}]),
  mkStudent(8,"MISS/008/26","Opolot Raymond",   "S3","Day Scholar",DEF_TERM,"0752100008","Sent Home",   []),
  mkStudent(9,"MISS/009/26","Nalwoga Sandra",   "S2","Day Scholar",DEF_TERM,"0702100009","Cleared",     [{date:"2026-02-11",amount:470000,method:"Cash",            ref:"CASH",       rcpt:"MISS-RCP-007",by:"bursar2"}]),
  mkStudent(10,"MISS/010/26","Muwanga Peter",   "S4","Boarder",    DEF_TERM,"0772100010","Outstanding", [{date:"2026-02-14",amount:400000,method:"Airtel Money",    ref:"AIR-2601002",rcpt:"MISS-RCP-008",by:"bursar1"}]),
  mkStudent(11,"MISS/011/26","Tendo Christine", "S1","Day Scholar",DEF_TERM,"0752100011","Cleared",     [{date:"2026-02-10",amount:460000,method:"MTN Mobile Money",ref:"MTN-2601004",rcpt:"MISS-RCP-009",by:"bursar2"}]),
  mkStudent(12,"MISS/012/26","Okiror Moses",    "S2","Boarder",    DEF_TERM,"0702100012","Notified",    []),
  mkStudent(13,"MISS/013/26","Namukasa Patience","S3","Day Scholar",DEF_TERM,"0772100013","Outstanding",[{date:"2026-02-18",amount:100000,method:"Cash",            ref:"CASH",       rcpt:"MISS-RCP-010",by:"bursar1"}]),
  mkStudent(14,"MISS/014/26","Byarugaba Mark",  "S5","Day Scholar",DEF_TERM,"0752100014","Sent Home",   []),
  mkStudent(15,"MISS/015/26","Atim Doreen",     "S1","Boarder",    DEF_TERM,"0702100015","Cleared",     [{date:"2026-02-07",amount:810000,method:"Bank Transfer",   ref:"STB-2601002",rcpt:"MISS-RCP-011",by:"bursar2"}]),
  mkStudent(16,"MISS/016/26","Kasozi Ibrahim",  "S6","Boarder",    DEF_TERM,"0772100016","Outstanding", [{date:"2026-02-13",amount:500000,method:"MTN Mobile Money",ref:"MTN-2601005",rcpt:"MISS-RCP-012",by:"bursar1"}]),
  mkStudent(17,"MISS/017/26","Nakimera Hawa",   "S4","Day Scholar",DEF_TERM,"0752100017","Cleared",     [{date:"2026-02-09",amount:520000,method:"Airtel Money",    ref:"AIR-2601003",rcpt:"MISS-RCP-013",by:"bursar2"}]),
  mkStudent(18,"MISS/018/26","Wandera Felix",   "S3","Boarder",    DEF_TERM,"0702100018","Outstanding", [{date:"2026-02-16",amount:200000,method:"Cash",            ref:"CASH",       rcpt:"MISS-RCP-014",by:"bursar1"}]),
];

const SEED_EXITS = [
  { id:1, studentId:3,  studentName:"Apio Grace",     admNo:"MISS/003/26", cls:"S3", dateOut:"2026-02-22", dateReturned:"2026-02-22", status:"Returned-Promised", promiseDate:"2026-03-01", promiseAmount:400000, notes:"Parent called. Will pay via MTN by 1st March.", by:"fees" },
  { id:2, studentId:8,  studentName:"Opolot Raymond", admNo:"MISS/008/26", cls:"S3", dateOut:"2026-02-22", dateReturned:"2026-02-22", status:"Returned-Unpaid",   promiseDate:"",           promiseAmount:0,       notes:"Did not go home. Walked around trading centre.", by:"fees" },
  { id:3, studentId:12, studentName:"Okiror Moses",   admNo:"MISS/012/26", cls:"S2", dateOut:"2026-02-22", dateReturned:"",           status:"Out",               promiseDate:"",           promiseAmount:0,       notes:"Sent home. Has not returned.", by:"fees" },
  { id:4, studentId:14, studentName:"Byarugaba Mark", admNo:"MISS/014/26", cls:"S5", dateOut:"2026-02-20", dateReturned:"2026-02-20", status:"Returned-Promised", promiseDate:"2026-02-28", promiseAmount:300000,  notes:"Parent lives far. Called from shop. Promise overdue.", by:"fees" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ugx  = n => "UGX " + Number(n).toLocaleString("en-UG");
const pcnt = (a,b) => b ? Math.round((a/b)*100) : 0;
const tod  = () => new Date().toISOString().split("T")[0];

function getPaySt(s) {
  if (s.amountPaid <= 0)           return "Unpaid";
  if (s.amountPaid >= s.totalFees) return "Paid";
  return "Partial";
}
function getClear(s) { return s.clearance || (s.amountPaid >= s.totalFees ? "Cleared" : "Outstanding"); }

const PST = {
  Paid:    { bg:"#d6edd9", tx:"#1a4d2b", dot:"#2d8a4e", lbl:"Fully Paid" },
  Partial: { bg:"#fef3c7", tx:"#854d0e", dot:"#d97706", lbl:"Partial"    },
  Unpaid:  { bg:"#fee2e2", tx:"#7f1d1d", dot:"#dc2626", lbl:"Unpaid"     },
};
const CLR = {
  Cleared:          { bg:"#d6edd9", tx:"#1a4d2b", dot:"#2d8a4e" },
  Outstanding:      { bg:"#fef3c7", tx:"#854d0e", dot:"#d97706" },
  Notified:         { bg:"#dbeafe", tx:"#1e40af", dot:"#3b82f6" },
  "Sent Home":      { bg:"#fee2e2", tx:"#7f1d1d", dot:"#dc2626" },
};
const EXS = {
  "Out":               { bg:"#fee2e2", tx:"#7f1d1d", dot:"#dc2626" },
  "Returned-Paid":     { bg:"#d6edd9", tx:"#1a4d2b", dot:"#2d8a4e" },
  "Returned-Promised": { bg:"#fef3c7", tx:"#854d0e", dot:"#d97706" },
  "Returned-Unpaid":   { bg:"#ede9fe", tx:"#5b21b6", dot:"#7c3aed" },
};

function nextRcpt(students) {
  let n = 0;
  students.forEach(s => s.payments.forEach(() => n++));
  return "MISS-RCP-" + String(n+1).padStart(3,"0");
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Bdg({ bg, tx, dot, children }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px",
      borderRadius:999, fontSize:10, fontWeight:600, background:bg, color:tx }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:dot, flexShrink:0 }}/>
      {children}
    </span>
  );
}

// ─── Receipt ──────────────────────────────────────────────────────────────────
function Receipt({ r, school }) {
  const RR = ({ l, v, c, bold }) => (
    <div style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", borderBottom:"1px dashed #f0efe9" }}>
      <span style={{ fontSize:11, color:"#64748b" }}>{l}</span>
      <span style={{ fontSize:11, fontWeight: bold ? 700 : 600, color: c || "#1a2e1f" }}>{v}</span>
    </div>
  );
  return (
    <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, padding:"24px 28px", fontFamily:"'Source Sans 3',Georgia,serif" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
        <div style={{ width:44, height:44, borderRadius:10, background:"#1a2e1f", color:"#fff", fontFamily:"'Lora',Georgia,serif", fontSize:22, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{school.charAt(0)}</div>
        <div>
          <div style={{ fontFamily:"'Lora',Georgia,serif", fontSize:15, fontWeight:700, color:"#1a2e1f" }}>{school}</div>
          <div style={{ fontSize:9, color:"#64748b", marginTop:2, textTransform:"uppercase", letterSpacing:"1.5px" }}>OFFICIAL PAYMENT RECEIPT</div>
        </div>
      </div>
      <div style={{ height:3, background:"#1a2e1f", borderRadius:2, marginBottom:11 }}/>
      <div style={{ display:"flex", marginBottom:11 }}>
        {[["Receipt No.",r.rcpt],["Date",r.date],["Term",r.term],["By",r.by]].map(([l,v]) => (
          <div key={l} style={{ flex:1, textAlign:"center", padding:"0 4px", borderRight:"1px solid #e8e4dd" }}>
            <div style={{ fontSize:8, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"1px", marginBottom:2 }}>{l}</div>
            <div style={{ fontSize:10, fontWeight:700, color:"#1a2e1f" }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ height:1, background:"#e8e4dd", margin:"10px 0" }}/>
      <div style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>Student Details</div>
      <RR l="Full Name"    v={r.student.name} />
      <RR l="Admission No" v={r.student.admNo} />
      <RR l="Class"        v={r.student.cls} />
      <RR l="Type"         v={r.student.type} />
      <div style={{ height:1, background:"#e8e4dd", margin:"10px 0" }}/>
      <div style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>Payment Details</div>
      <RR l="Method"           v={r.method} />
      {r.ref !== "CASH" && <RR l="Transaction Ref" v={r.ref} />}
      <RR l="Previous Balance" v={ugx(r.prevBal)} c="#b91c1c" />
      <RR l="Amount Paid"      v={ugx(r.amount)}  c="#1a6b3a" bold />
      <RR l="Balance Remaining" v={ugx(r.newBal)} c={r.newBal > 0 ? "#b91c1c" : "#1a6b3a"} />
      <div style={{ background:"#1a2e1f", borderRadius:7, padding:"12px 15px", textAlign:"center", margin:"10px 0" }}>
        <div style={{ fontSize:8, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:4 }}>AMOUNT RECEIVED</div>
        <div style={{ fontFamily:"'Lora',Georgia,serif", fontSize:22, fontWeight:700, color:"#fff" }}>{ugx(r.amount)}</div>
      </div>
      <div style={{ height:1, background:"#e8e4dd", margin:"10px 0" }}/>
      <div style={{ display:"flex", gap:16 }}>
        {["Bursar Signature","Official School Stamp"].map(l => (
          <div key={l} style={{ flex:1 }}>
            <div style={{ height:1, background:"#94a3b8", marginBottom:4 }}/>
            <div style={{ fontSize:9, color:"#94a3b8", textAlign:"center" }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:9, color:"#94a3b8", textAlign:"center", marginTop:10, borderTop:"1px solid #f0efe9", paddingTop:8 }}>
        Official receipt — retain as proof of payment · SFIS Lite · {school}
      </div>
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ onClose, children, wide }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, backdropFilter:"blur(4px)" }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:"26px 30px", width: wide ? 520 : 420, maxWidth:"96vw",
        boxShadow:"0 24px 80px rgba(0,0,0,.25)", display:"flex", flexDirection:"column", gap:12, maxHeight:"90vh", overflowY:"auto" }}
        className="fu" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Fld({ label, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:10, fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:".5px" }}>{label}</label>
      {children}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KCard({ label, value, sub, accent, icon, anim }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, padding:"17px 19px", boxShadow:"0 1px 3px rgba(0,0,0,.06)", borderTop:"3px solid "+accent }} className={anim}>
      <div style={{ fontSize:17, marginBottom:6 }}>{icon}</div>
      <div style={{ fontFamily:"'Lora',Georgia,serif", fontSize:19, fontWeight:700, color:accent, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:10, color:"#64748b", marginTop:5, textTransform:"uppercase", letterSpacing:".5px", fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{sub}</div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  function go() {
    if (!user || !pass) { setErr("Enter username and password."); return; }
    setBusy(true);
    setTimeout(() => {
      const found = DEMO_USERS.find(u => u.username === user && u.password === pass);
      if (found) { onLogin(found); }
      else { setErr("Incorrect credentials. Use demo accounts below."); setBusy(false); }
    }, 700);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#1a2e1f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Source Sans 3',Georgia,serif", position:"relative", overflow:"hidden", padding:"20px 16px" }}>
      <GS />
      <div style={{ position:"absolute", inset:0, opacity:.06, backgroundImage:"linear-gradient(#4a7c59 1px,transparent 1px),linear-gradient(90deg,#4a7c59 1px,transparent 1px)", backgroundSize:"40px 40px" }}/>
      <div style={{ background:"#fff", borderRadius:16, padding:"32px 36px", width:"100%", maxWidth:460, boxShadow:"0 32px 80px rgba(0,
