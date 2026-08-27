import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { PseudoQR, cx, downloadCSV, fmtDate, timeAgo, useAuth, usePageTitle } from "../core";
import {
  ACTIVITY, EXAMS, GRADE_DIST, IMPORT_ROWS, KPI, LEVELS, LOGINS_14D, PER_QUESTION,
  REVIEW_QUEUE, STUDENTS, type ImportRow, type StudentRow,
} from "../data";
import {
  Alert, Avatar, Bars, Btn, Card, Chip, Confirm, Donut, Drawer, EmptyState, Field, HBar,
  Menu, Modal, SearchBox, SelectInput, Spark, useToast,
} from "../ui";
import {
  IcArchive, IcBan, IcChart, IcCheck, IcCheckCircle, IcCopy,
  IcDatabase, IcDoc, IcDots, IcDownload, IcExam, IcHome, IcInfo, IcKey, IcLogout, IcMenu, IcPencil,
  IcPrint, IcQR, IcRefresh, IcSheet, IcUpload, IcUsers, IcXCircle, LogoMark,
} from "../icons";

/* ============ مخزن لوحة الأستاذ ============ */

export const teacherStore = {
  students: STUDENTS.map((s) => ({ ...s })),
  queue: REVIEW_QUEUE.map((r) => ({ ...r })),
};

const genPassword = (seed: string) => {
  let h = 7;
  for (const c of seed) h = (h * 33 + c.charCodeAt(0)) % 1679616;
  const s = h.toString(36).toUpperCase().padStart(4, "K");
  return `${s.slice(0, 3)}-${s.slice(-3)}`;
};

const STU_STATUS = {
  active: { l: "نشط", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  suspended: { l: "موقوف", cls: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  archived: { l: "مؤرشف", cls: "bg-ink-100 text-ink-500", dot: "bg-ink-400" },
};

/* ============ التخطيط ============ */

const NAV_GROUPS: { title: string; items: { to: string; end?: boolean; label: string; Icon: (p: { size?: number; className?: string }) => ReactNode; badge?: number }[] }[] = [
  { title: "نظرة عامة", items: [{ to: "/teacher", end: true, label: "لوحة القيادة", Icon: IcHome }] },
  {
    title: "التلاميذ",
    items: [
      { to: "/teacher/students", label: "إدارة التلاميذ", Icon: IcUsers },
      { to: "/teacher/import", label: "الاستيراد من Excel", Icon: IcSheet },
      { to: "/teacher/slips", label: "قصاصات الدخول", Icon: IcQR },
    ],
  },
  {
    title: "الامتحانات",
    items: [
      { to: "/teacher/exams", label: "الامتحانات", Icon: IcExam },
      { to: "/teacher/questions", label: "بنك الأسئلة", Icon: IcDatabase },
    ],
  },
  {
    title: "المحتوى والتقارير",
    items: [
      { to: "/teacher/review", label: "مراجعة المحتوى", Icon: IcDoc, badge: teacherStore.queue.length },
      { to: "/teacher/reports", label: "التقارير", Icon: IcChart },
    ],
  },
];

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="قائمة لوحة الأستاذ" className="space-y-6">
      {NAV_GROUPS.map((g) => (
        <div key={g.title}>
          <p className="mb-2 px-3 font-code text-[11px] font-semibold tracking-wide text-ink-500">{"// "}{g.title}</p>
          <div className="space-y-0.5">
            {g.items.map(({ to, end, label, Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cx(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14.5px] font-bold transition-all",
                    isActive ? "bg-primary-600 text-white shadow-sm shadow-primary-900/40" : "text-ink-300 hover:bg-white/5 hover:text-white",
                  )
                }
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="rounded-md bg-gold-400 px-1.5 py-0.5 text-[11px] font-bold text-ink-900">{badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

const PAGE_TITLES: [string, string][] = [
  ["/teacher/students", "إدارة التلاميذ"],
  ["/teacher/import", "الاستيراد من Excel"],
  ["/teacher/slips", "قصاصات الدخول"],
  ["/teacher/exams", "إدارة الامتحانات"],
  ["/teacher/questions", "بنك الأسئلة"],
  ["/teacher/review", "مراجعة المحتوى"],
  ["/teacher/reports", "الإحصائيات والتقارير"],
];

export function TeacherLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const pageTitle = location.pathname.endsWith("/stats")
    ? "إحصائيات الامتحان"
    : PAGE_TITLES.find(([p]) => location.pathname.startsWith(p))?.[1] ?? "لوحة القيادة";

  return (
    <div className="min-h-screen bg-paper">
      {/* الشريط الجانبي — حاسوب */}
      <aside className="no-print dark-zone fixed inset-y-0 start-0 z-50 hidden w-64 overflow-y-auto border-e border-ink-800 bg-ink-900 lg:block">
        <div className="flex items-center gap-2.5 border-b border-ink-800 px-5 py-5">
          <LogoMark size={36} />
          <div className="leading-none">
            <p className="font-display text-[15px] font-extrabold text-white">أستاذ المعلوماتية</p>
            <p className="mt-1 font-code text-[10px] text-accent-400">TEACHER·CONSOLE</p>
          </div>
        </div>
        <div className="p-4"><SideNav /></div>
        <div className="mt-4 border-t border-ink-800 p-4">
          <div className="flex items-center gap-2.5">
            <Avatar name={user?.name ?? ""} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-white">{user?.name}</p>
              <p className="font-code text-[10px] text-ink-400" dir="ltr">@{user?.username}</p>
            </div>
            <button
              onClick={() => { logout(); navigate("/"); }}
              aria-label="تسجيل الخروج"
              className="grid size-9 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <IcLogout size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* الدرج — هاتف */}
      <Drawer open={drawer} onClose={() => setDrawer(false)}>
        <div className="dark-zone bg-ink-900 p-5 min-h-screen">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2"><LogoMark size={32} /><span className="font-display font-extrabold text-white">لوحة الأستاذ</span></div>
            <button onClick={() => setDrawer(false)} aria-label="إغلاق" className="grid size-9 place-items-center rounded-lg text-ink-300 hover:bg-white/10"><IcXCircle size={19} /></button>
          </div>
          <SideNav onNavigate={() => setDrawer(false)} />
          <button onClick={() => { logout(); navigate("/"); }} className="mt-8 flex w-full items-center gap-2.5 rounded-xl border border-ink-700 px-4 py-3 text-sm font-bold text-ink-200 hover:bg-white/5">
            <IcLogout size={17} /> تسجيل الخروج
          </button>
        </div>
      </Drawer>

      <div className="lg:ps-64 print:ps-0">
        <header className="no-print sticky top-0 z-40 border-b border-ink-200/70 bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button onClick={() => setDrawer(true)} aria-label="فتح القائمة" className="grid size-10 place-items-center rounded-lg text-ink-500 hover:bg-ink-900/5 lg:hidden">
              <IcMenu size={21} />
            </button>
            <h1 className="font-display text-lg font-extrabold text-ink-900">{pageTitle}</h1>
            <span className="ms-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 sm:flex">
                <span className="size-1.5 rounded-full bg-emerald-500" /> الجلسة آمنة · 45 د
              </span>
              <Link to="/" className="hidden rounded-lg px-3 py-2 text-sm font-bold text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-800 sm:block">الواجهة العامة</Link>
              <Avatar name={user?.name ?? ""} size={36} className="lg:hidden" />
            </span>
          </div>
        </header>
        <main className="px-4 py-7 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

/* ============ لوحة القيادة ============ */

export function TeacherDashboard() {
  usePageTitle("لوحة القيادة");
  const { user } = useAuth();
  const [period, setPeriod] = useState("14");
  const logins = period === "7" ? LOGINS_14D.slice(-7) : LOGINS_14D;
  const labels = logins.map((_, i) => String(i + 1));

  return (
    <div className="space-y-7">
      <div className="dark-zone anim-fade-up relative overflow-hidden rounded-2xl bg-ink-900 p-7">
        <div className="absolute inset-0 bg-dots-dark opacity-40" />
        <div className="absolute -end-20 -top-20 size-56 rounded-full bg-accent-500/15 blur-[80px]" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="font-code text-xs font-semibold text-accent-300" dir="ltr">$ dashboard --today</p>
            <h1 className="font-display mt-2 text-2xl font-extrabold text-white sm:text-[28px]">مركز القيادة — أهلًا {user?.name.split(" ")[1] ?? user?.name} 👨‍🏫</h1>
            <p className="mt-2 text-sm text-ink-300">{fmtDate(new Date().toISOString())} · الأسدس الثاني · الموسم 2025/2026</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/teacher/import" className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-700 bg-ink-800/60 px-4 text-sm font-bold text-white transition-colors hover:border-accent-400/60"><IcUpload size={16} /> استيراد تلاميذ</Link>
            <Link to="/teacher/slips" className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-700 bg-ink-800/60 px-4 text-sm font-bold text-white transition-colors hover:border-accent-400/60"><IcPrint size={16} /> قصاصات الدخول</Link>
            <Link to="/teacher/review" className="relative inline-flex h-10 items-center gap-2 rounded-lg bg-gold-400 px-4 text-sm font-bold text-ink-900 transition-colors hover:bg-gold-300">
              <IcDoc size={16} /> مراجعة المحتوى
              <span className="rounded-md bg-ink-900 px-1.5 text-[11px] text-gold-300">{teacherStore.queue.length}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <section aria-label="مؤشرات رئيسية">
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 xl:grid-cols-8">
          {[
            { l: "إجمالي التلاميذ", v: String(KPI.students), icon: <IcUsers size={17} /> },
            { l: "دخلوا مرة واحدة", v: String(KPI.loggedInOnce), icon: <IcKey size={17} /> },
            { l: "نشطون (7 أيام)", v: String(KPI.active7), icon: <IcCheckCircle size={17} /> },
            { l: "نشطون (30 يومًا)", v: String(KPI.active30), icon: <IcCheckCircle size={17} /> },
            { l: "زيارات عامة", v: KPI.visits30.toLocaleString("en"), icon: <IcChart size={17} /> },
            { l: "امتحانات منشورة", v: String(KPI.publishedExams), icon: <IcExam size={17} /> },
            { l: "متوسط النتائج", v: `${KPI.avgScore}%`, icon: <IcInfo size={17} /> },
            { l: "بانتظار المراجعة", v: String(KPI.pendingContent), icon: <IcDoc size={17} />, warn: true },
          ].map((k) => (
            <Card key={k.l} className={cx("p-4 transition-all hover:-translate-y-0.5 hover:shadow-md", k.warn && "border-amber-300 bg-amber-50/50")}>
              <span className={cx("grid size-8 place-items-center rounded-lg", k.warn ? "bg-amber-100 text-amber-600" : "bg-primary-100 text-primary-700")}>{k.icon}</span>
              <p className="font-display mt-2.5 text-[22px] font-black leading-none text-ink-900">{k.v}</p>
              <p className="mt-1.5 text-[11.5px] font-bold text-ink-400">{k.l}</p>
            </Card>
          ))}
        </div>
        <div className="mt-3.5 grid gap-3.5 sm:grid-cols-3">
          <Card className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-ink-400">نسبة إكمال الامتحانات</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-primary-600" style={{ width: `${KPI.completionRate}%` }} /></div>
            </div>
            <p className="font-display text-xl font-black text-primary-700">{KPI.completionRate}%</p>
          </Card>
          <Card className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-ink-400">نسبة النجاح العامة</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${KPI.successRate}%` }} /></div>
            </div>
            <p className="font-display text-xl font-black text-emerald-600">{KPI.successRate}%</p>
          </Card>
          <Card className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-ink-400">زوار فريدون (30 يومًا)</p>
              <div className="mt-2"><Spark data={LOGINS_14D} color="#D98A1F" w={120} h={26} /></div>
            </div>
            <p className="font-display text-xl font-black text-gold-600">{KPI.unique30}</p>
          </Card>
        </div>
      </section>

      {/* الرسوم */}
      <section className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-bold text-ink-900">تسجيلات الدخول اليومية</h2>
            <div className="flex gap-1 rounded-lg bg-ink-100 p-1">
              {["7", "14"].map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={cx("rounded-md px-2.5 py-1 text-xs font-bold transition-all", period === p ? "bg-white text-primary-700 shadow-sm" : "text-ink-400")}>
                  {p} يومًا
                </button>
              ))}
            </div>
          </div>
          <Bars data={logins} labels={labels} height={130} />
          <p className="mt-3 text-xs font-semibold text-ink-400">الإجمالي: <span className="font-code text-ink-700">{logins.reduce((a, b) => a + b, 0)}</span> تسجيل دخول</p>
        </Card>
        <Card className="p-5">
          <h2 className="font-display mb-4 text-[15px] font-bold text-ink-900">توزيع النتائج</h2>
          <div className="flex items-center justify-center gap-6">
            <Donut
              segments={GRADE_DIST}
              center={
                <div className="text-center">
                  <p className="font-display text-2xl font-black text-ink-900">{KPI.avgScore}%</p>
                  <p className="text-[10px] font-bold text-ink-400">المتوسط</p>
                </div>
              }
            />
            <ul className="space-y-2.5">
              {GRADE_DIST.map((g) => (
                <li key={g.label} className="flex items-center gap-2 text-[12.5px] font-bold text-ink-600">
                  <span className="size-3 rounded-sm" style={{ background: g.color }} />
                  {g.label}
                  <span className="font-code text-ink-400">{g.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-bold text-ink-900">أصعب الأسئلة</h2>
            <Link to="/teacher/exams/ex1/stats" className="text-xs font-bold text-primary-600 hover:underline">التحليل الكامل</Link>
          </div>
          <div className="space-y-4">
            {[...PER_QUESTION].sort((a, b) => a.correct - b.correct).slice(0, 4).map((q) => (
              <HBar key={q.label} label={q.label} correct={q.correct} wrong={q.wrong} />
            ))}
          </div>
        </Card>
      </section>

      {/* النشاط الأخير */}
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <h2 className="font-display mb-4 text-[15px] font-bold text-ink-900">أحدث النشاطات</h2>
          <ol className="relative space-y-4 border-s-2 border-dashed border-ink-200 ps-5">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="relative">
                <span className={cx(
                  "absolute -start-[27px] top-0.5 grid size-5 place-items-center rounded-full border-2 border-white",
                  a.icon === "approve" ? "bg-emerald-500" : a.icon === "submit" ? "bg-amber-500" : a.icon === "exam" ? "bg-primary-500" : a.icon === "reset" || a.icon === "import" ? "bg-accent-500" : "bg-sky-500",
                )} />
                <p className="text-sm font-semibold text-ink-700">{a.text}</p>
                <p className="mt-0.5 text-xs text-ink-400">{timeAgo(a.time)}</p>
              </li>
            ))}
          </ol>
        </Card>
        <Card className="p-5">
          <h2 className="font-display mb-4 text-[15px] font-bold text-ink-900">أكثر الصفحات زيارة</h2>
          <ul className="space-y-3">
            {[
              { page: "الصفحة الرئيسية", views: 640 },
              { page: "قائمة المقالات", views: 312 },
              { page: "قائمة المشاريع", views: 276 },
              { page: "تسجيل دخول التلاميذ", views: 194 },
              { page: "مقال: النظام الثنائي", views: 128 },
            ].map((p, i) => (
              <li key={p.page} className="flex items-center gap-3">
                <span className="font-code grid size-7 shrink-0 place-items-center rounded-lg bg-ink-100 text-xs font-bold text-ink-500">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-ink-700">{p.page}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-accent-500" style={{ width: `${(p.views / 640) * 100}%` }} />
                  </div>
                </div>
                <span className="font-code text-xs font-bold text-ink-500">{p.views}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

/* ============ إدارة التلاميذ ============ */

export function StudentsPage() {
  usePageTitle("إدارة التلاميذ");
  const toast = useToast();
  const [, setTick] = useState(0);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("الكل");
  const [status, setStatus] = useState("الكل");
  const [selected, setSelected] = useState<string[]>([]);
  const [resetFor, setResetFor] = useState<StudentRow | null>(null);
  const [moveFor, setMoveFor] = useState<StudentRow[] | null>(null);
  const [moveTarget, setMoveTarget] = useState(LEVELS[0]);
  const [archiveFor, setArchiveFor] = useState<StudentRow | null>(null);
  const [bulkPw, setBulkPw] = useState(false);

  const filtered = teacherStore.students.filter(
    (s) =>
      (level === "الكل" || s.level === level) &&
      (status === "الكل" || s.status === status) &&
      (q.trim() === "" || s.name.includes(q) || s.username.includes(q)),
  );
  const allChecked = filtered.length > 0 && filtered.every((s) => selected.includes(s.id));

  const toggleAll = () => setSelected(allChecked ? [] : filtered.map((s) => s.id));
  const toggleOne = (id: string) => setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));

  const setStatusMany = (ids: string[], st: StudentRow["status"], msg: string) => {
    teacherStore.students.forEach((s) => { if (ids.includes(s.id)) s.status = st; });
    setSelected([]);
    setTick((t) => t + 1);
    toast.push({ tone: "success", title: msg, desc: `شمل الإجراء ${ids.length} تلميذًا.` });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-500">
          <strong className="font-code text-ink-800">{filtered.length}</strong> تلميذًا · {teacherStore.students.filter((s) => s.hasLoggedIn).length} سجّلوا الدخول · {teacherStore.students.filter((s) => !s.hasLoggedIn && s.status === "active").length} لم يدخلوا بعد
        </p>
        <div className="flex gap-2.5">
          <Link to="/teacher/import" className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-bold text-ink-600 transition-all hover:border-primary-400 hover:text-primary-700"><IcUpload size={16} /> استيراد</Link>
          <Link to="/teacher/slips" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white transition-colors hover:bg-primary-700"><IcPrint size={16} /> قصاصات</Link>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox value={q} onChange={setQ} placeholder="ابحث بالاسم أو اسم المستخدم…" className="w-full sm:w-72" />
          <SelectInput value={level} onChange={(e) => setLevel(e.target.value)} className="w-44" aria-label="تصفية حسب المستوى">
            <option value="الكل">كل المستويات</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </SelectInput>
          <SelectInput value={status} onChange={(e) => setStatus(e.target.value)} className="w-36" aria-label="تصفية حسب الحالة">
            <option value="الكل">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="suspended">موقوف</option>
            <option value="archived">مؤرشف</option>
          </SelectInput>
        </div>

        {/* شريط الإجراءات الجماعية */}
        {selected.length > 0 && (
          <div className="anim-fade-up mt-3.5 flex flex-wrap items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5">
            <p className="text-sm font-bold text-primary-800">{selected.length} محدد</p>
            <span className="mx-1 h-5 w-px bg-primary-200" />
            <Btn v="outline" sm icon={<IcRefresh size={14} />} onClick={() => setMoveFor(teacherStore.students.filter((s) => selected.includes(s.id)))}>نقل مستوى</Btn>
            <Btn v="outline" sm icon={<IcKey size={14} />} onClick={() => setBulkPw(true)}>إعادة تعيين كلمات المرور</Btn>
            <Btn v="outline" sm icon={<IcBan size={14} />} onClick={() => setStatusMany(selected, "suspended", "أُوقف التلاميذ المحددون")}>إيقاف</Btn>
            <Btn v="outline" sm icon={<IcArchive size={14} />} onClick={() => setStatusMany(selected, "archived", "أُرشف التلاميذ المحددون")}>أرشفة</Btn>
            <button onClick={() => setSelected([])} className="ms-auto text-xs font-bold text-primary-700 underline underline-offset-4">إلغاء التحديد</button>
          </div>
        )}

        {/* الجدول — حاسوب */}
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] text-start">
            <thead>
              <tr className="border-b border-ink-200 text-[12.5px] text-ink-400">
                <th className="w-10 px-2 py-2.5"><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="تحديد الكل" className="size-4 accent-primary-600" /></th>
                <th className="px-2 py-2.5 text-start font-bold">التلميذ</th>
                <th className="px-2 py-2.5 text-start font-bold">المستوى</th>
                <th className="px-2 py-2.5 text-start font-bold">الحالة</th>
                <th className="px-2 py-2.5 text-start font-bold">آخر دخول</th>
                <th className="px-2 py-2.5 text-start font-bold">المعدل</th>
                <th className="w-14 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className={cx("border-b border-ink-100 transition-colors hover:bg-ink-50/60", selected.includes(s.id) && "bg-primary-50/50")}>
                  <td className="px-2 py-3"><input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleOne(s.id)} aria-label={`تحديد ${s.name}`} className="size-4 accent-primary-600" /></td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size={34} />
                      <div>
                        <p className="text-sm font-bold text-ink-800">{s.name}</p>
                        <p className="font-code text-[11px] text-ink-400" dir="ltr">@{s.username}</p>
                      </div>
                      {!s.hasLoggedIn && <Chip tone="amber" className="px-1.5 py-0.5 text-[10px]">لم يدخل بعد</Chip>}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-[13px] font-semibold text-ink-600">{s.level} <span className="text-ink-300">· {s.group}</span></td>
                  <td className="px-2 py-3">
                    <span className={cx("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-bold", STU_STATUS[s.status].cls)}>
                      <span className={cx("size-1.5 rounded-full", STU_STATUS[s.status].dot)} /> {STU_STATUS[s.status].l}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-[13px] font-semibold text-ink-500">{s.lastLogin ? timeAgo(s.lastLogin) : "—"}</td>
                  <td className="px-2 py-3"><span className="font-code text-sm font-bold text-ink-700">{s.avg !== null ? s.avg.toFixed(1) : "—"}</span></td>
                  <td className="px-2 py-3">
                    <StudentRowMenu s={s} onReset={() => setResetFor(s)} onMove={() => { setMoveFor([s]); setMoveTarget(s.level); }} onArchive={() => setArchiveFor(s)} onChanged={() => setTick((t) => t + 1)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* بطاقات — هاتف */}
        <div className="mt-4 space-y-3 md:hidden">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-xl border border-ink-100 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={s.name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-800">{s.name}</p>
                  <p className="font-code text-[11px] text-ink-400" dir="ltr">@{s.username}</p>
                </div>
                <StudentRowMenu s={s} onReset={() => setResetFor(s)} onMove={() => { setMoveFor([s]); setMoveTarget(s.level); }} onArchive={() => setArchiveFor(s)} onChanged={() => setTick((t) => t + 1)} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-ink-500">
                <span className={cx("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold", STU_STATUS[s.status].cls)}><span className={cx("size-1.5 rounded-full", STU_STATUS[s.status].dot)} /> {STU_STATUS[s.status].l}</span>
                <span>{s.level} · {s.group}</span>
                <span className="ms-auto">{s.lastLogin ? timeAgo(s.lastLogin) : "لم يدخل بعد"}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-4">
            <EmptyState icon={<IcUsers size={28} />} title="لا نتائج للبحث" desc="عدّل كلمات البحث أو الفلاتر للعثور على التلاميذ." />
          </div>
        )}
      </Card>

      {/* نافذة إعادة التعيين */}
      <Modal open={!!resetFor} onClose={() => setResetFor(null)} title="إعادة تعيين كلمة المرور" footer={<Btn sm onClick={() => setResetFor(null)}>تم</Btn>}>
        {resetFor && (
          <div className="space-y-4">
            <p className="text-sm leading-7 text-ink-600">أُنشئت كلمة مرور مؤقتة جديدة للتلميذ <strong>{resetFor.name}</strong>:</p>
            <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 px-4 py-3">
              <span className="font-code text-xl font-bold tracking-widest text-primary-800" dir="ltr">{genPassword(resetFor.username + "new")}</span>
              <button
                onClick={() => { navigator.clipboard?.writeText(genPassword(resetFor.username + "new")); toast.push({ tone: "success", title: "نُسخت كلمة المرور" }); }}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary-600 px-3 text-xs font-bold text-white"
              >
                <IcCopy size={14} /> نسخ
              </button>
            </div>
            <Alert tone="warning" title="تظهر مرة واحدة فقط">
              سلّمها للتلميذ شخصيًا أو اطبع قصاصة جديدة. سيُطالَب بتغييرها عند أول دخول.
            </Alert>
          </div>
        )}
      </Modal>

      {/* نافذة نقل المستوى */}
      <Modal
        open={!!moveFor}
        onClose={() => setMoveFor(null)}
        title={`نقل ${moveFor?.length === 1 ? moveFor[0].name : `${moveFor?.length} تلاميذ`} إلى مستوى آخر`}
        footer={
          <>
            <Btn v="ghost" sm onClick={() => setMoveFor(null)}>إلغاء</Btn>
            <Btn sm onClick={() => {
              moveFor?.forEach((m) => { const real = teacherStore.students.find((x) => x.id === m.id); if (real) real.level = moveTarget; });
              toast.push({ tone: "success", title: "تم النقل", desc: `نُقل ${moveFor?.length} تلميذ إلى ${moveTarget}.` });
              setMoveFor(null); setSelected([]); setTick((t) => t + 1);
            }}>تأكيد النقل</Btn>
          </>
        }
      >
        <Field label="المستوى الجديد">
          <SelectInput value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)}>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </SelectInput>
        </Field>
      </Modal>

      {/* تأكيد الأرشفة */}
      <Confirm
        open={!!archiveFor}
        onClose={() => setArchiveFor(null)}
        onYes={() => { if (archiveFor) { archiveFor.status = "archived"; setTick((t) => t + 1); toast.push({ tone: "success", title: "أُرشف التلميذ", desc: "بقيت بياناته محفوظة ويمكن استعادتها." }); } }}
        title="أرشفة التلميذ؟"
        desc={`سيُؤرشف حساب ${archiveFor?.name} مع الاحتفاظ بكل بياناته ونتائجه. لا يمكن حذف تلميذ لديه نتائج مسجلة — الأرشفة هي البديل الآمن.`}
        yesLabel="أرشفة"
        tone="danger"
      />

      {/* كلمات مرور جماعية */}
      <Modal open={bulkPw} onClose={() => setBulkPw(false)} title="إعادة تعيين كلمات المرور" footer={<Btn sm onClick={() => setBulkPw(false)}>تم</Btn>}>
        <p className="text-sm leading-7 text-ink-600">أُعيد تعيين كلمات مرور <strong>{selected.length}</strong> تلميذًا. الكلمات الجديدة متاحة في <strong>قصاصات الدخول</strong> — اطبعها وسلّمها شخصيًا.</p>
        <div className="mt-3">
          <Link to="/teacher/slips" onClick={() => setBulkPw(false)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white"><IcPrint size={16} /> الذهاب إلى القصاصات</Link>
        </div>
      </Modal>
    </div>
  );
}

function StudentRowMenu({ s, onReset, onMove, onArchive, onChanged }: { s: StudentRow; onReset: () => void; onMove: () => void; onArchive: () => void; onChanged: () => void }) {
  const toast = useToast();
  return (
    <Menu
      align="end"
      button={
        <button aria-label={`إجراءات ${s.name}`} className="grid size-9 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"><IcDots size={18} /></button>
      }
      items={[
        { label: "تعديل البيانات", icon: <IcPencil size={15} />, onClick: () => toast.push({ tone: "info", title: "تعديل البيانات", desc: "في النسخة الكاملة يفتح نموذج التعديل هنا." }) },
        { label: "إعادة تعيين كلمة المرور", icon: <IcKey size={15} />, onClick: onReset },
        { label: "نقل إلى مستوى آخر", icon: <IcRefresh size={15} />, onClick: onMove },
        s.status === "suspended"
          ? { label: "تفعيل الحساب", icon: <IcCheckCircle size={15} />, onClick: () => { s.status = "active"; onChanged(); toast.push({ tone: "success", title: "فُعّل الحساب", desc: `عاد ${s.name} نشطًا.` }); } }
          : { label: "إيقاف مؤقت", icon: <IcBan size={15} />, onClick: () => { s.status = "suspended"; onChanged(); toast.push({ tone: "warning", title: "أُوقف الحساب مؤقتًا", desc: "لن يتمكن من الدخول حتى تفعيله." }); } },
        { label: "حذف نهائي", icon: <IcXCircle size={15} />, danger: true, onClick: () => toast.push({ tone: "error", title: "الحذف ممنوع", desc: "لا يمكن حذف تلميذ مرتبط بنتائج — استخدم الأرشفة بدلًا من ذلك." }) },
        { label: "أرشفة", icon: <IcArchive size={15} />, onClick: onArchive },
      ]}
    />
  );
}

/* ============ معالج الاستيراد ============ */

export function ImportWizardPage() {
  usePageTitle("الاستيراد من Excel");
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [policy, setPolicy] = useState<"skip" | "update" | "error">("skip");
  const [done, setDone] = useState<{ ok: number; rejected: number; ignored: number } | null>(null);

  const STEPS = ["القالب", "رفع الملف", "مطابقة الأعمدة", "التحقق", "التأكيد", "الملخص"];

  const evaluated = useMemoEval(rows, policy);

  function useMemoEval(r: ImportRow[] | null, pol: "skip" | "update" | "error") {
    if (!r) return null;
    const list = r.map((row) => {
      if (!row.error) return { ...row, verdict: "ok" as const };
      const isDup = row.error.includes("مستعمل مسبقًا");
      if (isDup && pol === "skip") return { ...row, verdict: "ignored" as const };
      if (isDup && pol === "update") return { ...row, verdict: "updated" as const };
      return { ...row, verdict: "error" as const };
    });
    return {
      list,
      ok: list.filter((x) => x.verdict === "ok").length,
      updated: list.filter((x) => x.verdict === "updated").length,
      ignored: list.filter((x) => x.verdict === "ignored").length,
      errors: list.filter((x) => x.verdict === "error").length,
    };
  }

  const loadDemo = (name = "تلاميذ_الفوج_الثاني.xlsx") => {
    setRows(IMPORT_ROWS.map((r) => ({ ...r })));
    setFileName(name);
    setStep(3);
  };

  const confirmImport = () => {
    if (!evaluated) return;
    const ok = evaluated.ok + evaluated.updated;
    setDone({ ok, rejected: evaluated.errors, ignored: evaluated.ignored });
    setStep(6);
    toast.push({ tone: "success", title: "اكتمل الاستيراد", desc: `أضيف ${ok} تلميذًا بنجاح.` });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* مؤشر الخطوات */}
      <ol className="flex flex-wrap items-center gap-y-3" aria-label="خطوات الاستيراد">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const stateCls = step > n ? "bg-emerald-500 text-white" : step === n ? "bg-primary-600 text-white ring-4 ring-primary-100" : "bg-ink-100 text-ink-400";
          return (
            <li key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <span className={cx("grid size-9 place-items-center rounded-full text-sm font-bold transition-all", stateCls)}>
                  {step > n ? <IcCheck size={16} /> : n}
                </span>
                <span className={cx("whitespace-nowrap text-[11px] font-bold", step === n ? "text-primary-700" : "text-ink-400")}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <span className={cx("mx-2 mb-5 h-0.5 w-6 rounded-full sm:w-12", step > n ? "bg-emerald-400" : "bg-ink-200")} />}
            </li>
          );
        })}
      </ol>

      <Card className="p-6 sm:p-8">
        {step === 1 && (
          <div className="text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary-100 text-primary-700"><IcSheet size={32} /></span>
            <h2 className="font-display mt-4 text-xl font-extrabold text-ink-900">ابدأ بتنزيل القالب الجاهز</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink-500">املأ القالب ببيانات تلاميذك — الأعمدة جاهزة: الاسم الكامل، اسم المستخدم، المستوى، المجموعة.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Btn icon={<IcDownload size={17} />} onClick={() => {
                downloadCSV("قالب_استيراد_التلاميذ.csv", ["الاسم الكامل", "اسم المستخدم", "المستوى", "المجموعة"], [["سعيد أمزيان", "said.amziane", "الأولى إعدادي", "أ"]]);
                toast.push({ tone: "success", title: "نُزّل القالب", desc: "افتحه في Excel أو LibreOffice." });
              }}>تنزيل القالب (CSV)</Btn>
              <Btn v="outline" onClick={() => setStep(2)}>التالي</Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink-900">ارفع ملف التلاميذ</h2>
            <p className="mt-2 text-sm text-ink-500">الصيغ المدعومة: xlsx, xls, csv — بحد أقصى 500 صف.</p>
            <label className="mt-6 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50/50 px-6 py-12 text-center transition-all hover:border-primary-400 hover:bg-primary-50/40">
              <span className="grid size-14 place-items-center rounded-2xl bg-white text-primary-600 shadow-sm"><IcUpload size={26} /></span>
              <span className="text-[15px] font-bold text-ink-700">اسحب الملف هنا أو اضغط للاختيار</span>
              <span className="text-xs text-ink-400">للتجربة، يمكنك استعمال البيانات التجريبية أسفله</span>
              <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={(e) => { if (e.target.files?.[0]) loadDemo(e.target.files[0].name); }} />
            </label>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button onClick={() => loadDemo()} className="inline-flex h-11 items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-5 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-100">
                <IcSheet size={17} /> تحميل بيانات تجريبية (12 صفًا)
              </button>
              <Btn v="ghost" onClick={() => setStep(1)}>رجوع</Btn>
            </div>
          </div>
        )}

        {step === 3 && evaluated && (
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink-900">مطابقة الأعمدة</h2>
            <p className="mt-2 text-sm text-ink-500">تعرّفنا على الملف <span className="font-code text-primary-700" dir="ltr">{fileName}</span> — تأكد من مطابقة الأعمدة:</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { col: "A", field: "الاسم الكامل", match: "name" },
                { col: "B", field: "اسم المستخدم", match: "username" },
                { col: "C", field: "المستوى", match: "level" },
                { col: "D", field: "المجموعة", match: "group" },
              ].map((c) => (
                <div key={c.col} className="rounded-xl border border-ink-200 p-3.5">
                  <p className="font-code text-[11px] font-bold text-ink-400" dir="ltr">Column {c.col}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink-800"><IcCheckCircle size={15} className="text-emerald-500" /> {c.field}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 overflow-hidden rounded-xl border border-ink-200">
              <p className="border-b border-ink-200 bg-ink-50 px-4 py-2.5 text-xs font-bold text-ink-500">معاينة أول 5 صفوف</p>
              <table className="w-full text-sm">
                <tbody>
                  {rows!.slice(0, 5).map((r) => (
                    <tr key={r.row} className="border-b border-ink-100 last:border-0">
                      <td className="px-4 py-2.5 font-bold text-ink-700">{r.name || <span className="text-rose-500">(فارغ)</span>}</td>
                      <td className="px-2 py-2.5 font-code text-xs text-ink-500" dir="ltr">{r.username}</td>
                      <td className="px-2 py-2.5 text-ink-500">{r.level}</td>
                      <td className="px-4 py-2.5 text-ink-500">{r.group}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex justify-between">
              <Btn v="ghost" onClick={() => setStep(2)}>رجوع</Btn>
              <Btn onClick={() => setStep(4)}>متابعة إلى التحقق</Btn>
            </div>
          </div>
        )}

        {step === 4 && evaluated && (
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink-900">نتائج التحقق من البيانات</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-emerald-50 p-3.5 text-center"><p className="font-display text-2xl font-black text-emerald-600">{evaluated.ok}</p><p className="text-xs font-bold text-emerald-700">صفوف سليمة</p></div>
              <div className="rounded-xl bg-primary-50 p-3.5 text-center"><p className="font-display text-2xl font-black text-primary-700">{evaluated.updated}</p><p className="text-xs font-bold text-primary-700">تكرار سيُحدَّث</p></div>
              <div className="rounded-xl bg-amber-50 p-3.5 text-center"><p className="font-display text-2xl font-black text-amber-600">{evaluated.ignored}</p><p className="text-xs font-bold text-amber-700">تكرار سيُتجاهل</p></div>
              <div className="rounded-xl bg-rose-50 p-3.5 text-center"><p className="font-display text-2xl font-black text-rose-600">{evaluated.errors}</p><p className="text-xs font-bold text-rose-700">أخطاء</p></div>
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2.5 text-sm font-bold text-ink-700">سياسة التعامل مع الصفوف المكررة</legend>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {([
                  { v: "skip", t: "تجاهل التكرار", d: "إبقاء الحساب القديم كما هو" },
                  { v: "update", t: "تحديث الموجود", d: "تحديث بيانات الحساب الحالي" },
                  { v: "error", t: "اعتباره خطأ", d: "رفض الصف المكرر بالكامل" },
                ] as const).map((o) => (
                  <label key={o.v} className={cx("cursor-pointer rounded-xl border-2 p-3.5 transition-all has-checked:border-primary-500 has-checked:bg-primary-50", policy === o.v ? "border-primary-500 bg-primary-50" : "border-ink-200")}>
                    <input type="radio" name="policy" className="sr-only" checked={policy === o.v} onChange={() => setPolicy(o.v)} />
                    <p className="text-sm font-bold text-ink-800">{o.t}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{o.d}</p>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 max-h-72 overflow-y-auto rounded-xl border border-ink-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-ink-50 text-xs text-ink-500">
                  <tr><th className="px-3 py-2.5 text-start font-bold">الصف</th><th className="px-2 py-2.5 text-start font-bold">الاسم</th><th className="px-2 py-2.5 text-start font-bold">الحالة</th><th className="px-3 py-2.5 text-start font-bold">ملاحظة</th></tr>
                </thead>
                <tbody>
                  {evaluated.list.map((r) => (
                    <tr key={r.row} className={cx("border-t border-ink-100", r.verdict === "error" && "bg-rose-50/60")}>
                      <td className="px-3 py-2.5 font-code text-xs text-ink-400">#{r.row}</td>
                      <td className="px-2 py-2.5 font-bold text-ink-700">{r.name || "—"}</td>
                      <td className="px-2 py-2.5">
                        {r.verdict === "ok" && <Chip tone="emerald"><IcCheck size={12} /> سليم</Chip>}
                        {r.verdict === "updated" && <Chip tone="primary"><IcRefresh size={12} /> سيُحدَّث</Chip>}
                        {r.verdict === "ignored" && <Chip tone="amber">سيُتجاهل</Chip>}
                        {r.verdict === "error" && <Chip tone="rose"><IcXCircle size={12} /> خطأ</Chip>}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-semibold text-rose-600">{r.verdict === "error" ? r.error : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex justify-between">
              <Btn v="ghost" onClick={() => setStep(3)}>رجوع</Btn>
              <Btn onClick={() => setStep(5)}>متابعة إلى التأكيد</Btn>
            </div>
          </div>
        )}

        {step === 5 && evaluated && (
          <div className="text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-100 text-amber-600"><IcInfo size={30} /></span>
            <h2 className="font-display mt-4 text-xl font-extrabold text-ink-900">تأكيد الاستيراد</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink-500">
              سيُستورد <strong className="text-emerald-600">{evaluated.ok + evaluated.updated}</strong> تلميذًا،
              ويُرفض <strong className="text-rose-600">{evaluated.errors}</strong>،
              ويُتجاهل <strong className="text-amber-600">{evaluated.ignored}</strong>.
              ستُولَّد كلمات مرور أولية تلقائيًا ويمكن طباعتها كقصاصات فور الانتهاء.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Btn v="ghost" onClick={() => setStep(4)}>رجوع</Btn>
              <Btn v="success" icon={<IcCheck size={17} />} onClick={confirmImport}>تأكيد الاستيراد النهائي</Btn>
            </div>
          </div>
        )}

        {step === 6 && done && (
          <div className="text-center">
            <span className="anim-pop mx-auto grid size-20 place-items-center rounded-3xl bg-emerald-100 text-emerald-600"><IcCheckCircle size={40} /></span>
            <h2 className="font-display mt-4 text-2xl font-extrabold text-ink-900">اكتمل الاستيراد!</h2>
            <div className="mx-auto mt-5 grid max-w-lg grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 p-4"><p className="font-display text-3xl font-black text-emerald-600">{done.ok}</p><p className="text-xs font-bold text-emerald-700">نجح</p></div>
              <div className="rounded-xl bg-rose-50 p-4"><p className="font-display text-3xl font-black text-rose-600">{done.rejected}</p><p className="text-xs font-bold text-rose-700">رُفض</p></div>
              <div className="rounded-xl bg-amber-50 p-4"><p className="font-display text-3xl font-black text-amber-600">{done.ignored}</p><p className="text-xs font-bold text-amber-700">تُجاهل</p></div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {done.rejected > 0 && (
                <Btn v="outline" icon={<IcDownload size={16} />} onClick={() => {
                  downloadCSV("تقرير_أخطاء_الاستيراد.csv", ["رقم الصف", "الاسم", "الخطأ"], evaluated?.list.filter((r) => r.verdict === "error").map((r) => [r.row, r.name, r.error ?? ""]) ?? []);
                }}>تنزيل تقرير الأخطاء</Btn>
              )}
              <Link to="/teacher/students" className="inline-flex h-11 items-center rounded-lg bg-primary-600 px-6 text-sm font-bold text-white transition-colors hover:bg-primary-700">إدارة التلاميذ</Link>
              <Link to="/teacher/slips" className="inline-flex h-11 items-center gap-2 rounded-lg border border-ink-200 bg-white px-5 text-sm font-bold text-ink-600 hover:border-primary-400 hover:text-primary-700"><IcPrint size={16} /> طباعة القصاصات</Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============ قصاصات الدخول ============ */

export function SlipsPage() {
  usePageTitle("قصاصات الدخول");
  const toast = useToast();
  const [level, setLevel] = useState("الكل");
  const students = teacherStore.students.filter((s) => (level === "الكل" || s.level === level) && s.status === "active");

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink-900">قصاصات بيانات الدخول</h2>
          <p className="mt-1 text-sm text-ink-500">{students.length} قصاصة · تُرتَّب في صفحات A4 مع خطوط قص واضحة.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SelectInput value={level} onChange={(e) => setLevel(e.target.value)} className="w-48" aria-label="اختيار المستوى">
            <option value="الكل">كل المستويات</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </SelectInput>
          <Btn icon={<IcPrint size={17} />} onClick={() => { toast.push({ tone: "info", title: "جارٍ تجهيز الطباعة", desc: "اختر A4 في نافذة الطباعة." }); setTimeout(() => window.print(), 400); }}>
            طباعة A4
          </Btn>
        </div>
      </div>

      <div className="no-print">
        <Alert tone="warning" title="كلمات المرور تظهر هنا فقط">
          الكلمات المعروضة أولية، وتظهر عند الإنشاء أو إعادة التعيين فقط — لن تراها مرة أخرى داخل المنصة. سلّم كل قصاصة لصاحبها شخصيًا.
        </Alert>
      </div>

      <div className="print-sheet grid grid-cols-1 gap-4 sm:grid-cols-2">
        {students.map((s) => (
          <div key={s.id} className="slip-card rounded-xl border-2 border-dashed border-ink-300 bg-white p-5">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2">
                <LogoMark size={28} />
                <div className="leading-none">
                  <p className="font-display text-[13px] font-extrabold text-ink-900">منصة أستاذ المعلوماتية</p>
                  <p className="mt-0.5 font-code text-[9px] text-ink-400" dir="ltr">ostad-info.ma</p>
                </div>
              </div>
              <span className="rounded-md bg-primary-100 px-2 py-1 text-[10.5px] font-bold text-primary-700">{s.level} · {s.group}</span>
            </div>
            <div className="flex gap-4 pt-4">
              <div className="flex-1 space-y-2.5">
                <div>
                  <p className="text-[10px] font-bold text-ink-400">التلميذ(ة)</p>
                  <p className="font-display text-[16px] font-extrabold text-ink-900">{s.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-ink-50 px-2.5 py-2">
                    <p className="text-[9.5px] font-bold text-ink-400">اسم المستخدم</p>
                    <p className="font-code mt-0.5 truncate text-[12.5px] font-bold text-ink-800" dir="ltr">{s.username}</p>
                  </div>
                  <div className="rounded-lg border border-dashed border-primary-300 bg-primary-50 px-2.5 py-2">
                    <p className="text-[9.5px] font-bold text-primary-500">كلمة المرور الأولية</p>
                    <p className="font-code mt-0.5 text-[12.5px] font-bold tracking-wider text-primary-800" dir="ltr">{genPassword(s.username)}</p>
                  </div>
                </div>
                <p className="text-[9.5px] leading-4 text-ink-400">يُطلب تغيير كلمة المرور عند أول دخول · تُسلَّم القصاصة للتلميذ شخصيًا</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <PseudoQR seed={s.username + s.name} size={72} />
                <span className="font-code text-[8.5px] text-ink-400" dir="ltr">scan to login</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="no-print text-center text-xs text-ink-400">✂ القص على الخطوط المتقطعة — كل صفحة A4 تتسع حتى 8 قصاصات.</p>
    </div>
  );
}
