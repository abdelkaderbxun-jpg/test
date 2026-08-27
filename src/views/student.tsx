import { useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { cx, daysUntil, fmtDate, timeAgo, useAuth, usePageTitle } from "../core";
import {
  ARTICLES, CLASSMATES, COVERS, EXAMS, NOTIFS, PROJECTS, type Article, type Project,
} from "../data";
import {
  Alert, Avatar, Btn, Card, Chip, Confirm, CoverImg, EmptyState, ExamPill, Field, Modal,
  SearchBox, SelectInput, StatusPill, TextArea, TextInput, useToast,
} from "../ui";
import {
  IcBell, IcCalendar, IcCap, IcCheck, IcCheckCircle, IcClock, IcDoc, IcExam, IcExternal, IcEye,
  IcFlag, IcHome, IcInfo, IcKey, IcLogout, IcPencil, IcPlay, IcPlus, IcProject, IcRefresh,
  IcSend, IcTrophy, IcUser, IcUsers, LogoMark,
} from "../icons";

/* ============ مخزن الجلسة (يعيش خلال التنقل) ============ */

const store = {
  articles: ARTICLES.filter((a) => a.owner).map((a) => ({ ...a })),
  projects: PROJECTS.filter((p) => p.owner).map((p) => ({ ...p })),
  notifs: NOTIFS.map((n) => ({ ...n })),
};

function loadJSON<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/* ============ التخطيط العام ============ */

const NAV = [
  { to: "/student", end: true, label: "لوحة البداية", Icon: IcHome },
  { to: "/student/exams", end: false, label: "الامتحانات", Icon: IcExam },
  { to: "/student/articles", end: false, label: "مقالاتي", Icon: IcDoc },
  { to: "/student/projects", end: false, label: "مشاريعي", Icon: IcProject },
  { to: "/student/notifications", end: false, label: "الإشعارات", Icon: IcBell },
  { to: "/student/profile", end: false, label: "ملفي الشخصي", Icon: IcUser },
];

export function StudentLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const unread = store.notifs.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-paper pb-20 md:pb-0">
      <header className="no-print sticky top-0 z-50 border-b border-ink-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/student" className="flex items-center gap-2">
            <LogoMark size={34} />
            <span className="hidden font-display text-[15px] font-extrabold text-ink-900 sm:block">فضاء التلميذ</span>
          </Link>
          <span className="mx-2 hidden h-6 w-px bg-ink-200 sm:block" />
          <span className="hidden items-center gap-2 text-sm font-bold text-ink-600 sm:flex">
            <Avatar name={user?.name ?? ""} size={30} />
            {user?.name}
            <Chip tone="primary" className="px-2 py-0.5 text-[11px]">{user?.level}</Chip>
          </span>
          <div className="ms-auto flex items-center gap-2">
            <Link to="/" className="hidden rounded-lg px-3 py-2 text-sm font-bold text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-800 lg:block">
              الواجهة العامة
            </Link>
            <Link to="/student/notifications" aria-label={`الإشعارات${unread ? ` (${unread} غير مقروءة)` : ""}`} className="relative grid size-10 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-800">
              <IcBell size={20} />
              {unread > 0 && <span className="absolute end-1.5 top-1.5 grid size-4.5 min-w-4.5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
            </Link>
            <Link to="/student/profile" className="sm:hidden"><Avatar name={user?.name ?? ""} size={34} /></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-7 px-4 py-7 sm:px-6">
        <aside className="no-print sticky top-[86px] hidden h-fit w-56 shrink-0 md:block">
          <nav className="space-y-1" aria-label="قائمة فضاء التلميذ">
            {NAV.map(({ to, end, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] font-bold transition-all",
                    isActive ? "bg-primary-600 text-white shadow-sm shadow-primary-600/25" : "text-ink-500 hover:bg-white hover:text-ink-800",
                  )
                }
              >
                <Icon size={19} />
                {label}
                {label === "الإشعارات" && unread > 0 && (
                  <span className="ms-auto rounded-md bg-rose-100 px-1.5 py-0.5 text-[11px] font-bold text-rose-600">{unread}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 rounded-xl border border-dashed border-ink-200 bg-white/60 p-4 text-center">
            <IcCap size={22} className="mx-auto text-primary-600" />
            <p className="mt-2 text-xs leading-5 text-ink-400">موسم 2025/2026<br />الأسدس الثاني</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* تنقل الهاتف السفلي */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-ink-200 bg-white/95 backdrop-blur-md md:hidden" aria-label="التنقل السفلي" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-5">
          {NAV.filter((n) => n.label !== "الإشعارات").map(({ to, end, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx("flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold transition-colors", isActive ? "text-primary-700" : "text-ink-400")
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cx("grid h-7 w-12 place-items-center rounded-full transition-colors", isActive && "bg-primary-100")}>
                    <Icon size={19} />
                  </span>
                  {label === "لوحة البداية" ? "الرئيسية" : label === "ملفي الشخصي" ? "حسابي" : label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

function PageHead({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">{title}</h1>
        {desc && <p className="mt-1.5 text-[15px] text-ink-500">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

/* ============ لوحة البداية ============ */

export function StudentDashboard() {
  const { user } = useAuth();
  usePageTitle("لوحة البداية");
  const [, setTick] = useState(0);
  const toast = useToast();
  const myExams = EXAMS.filter((e) => e.status !== "draft");
  const available = myExams.filter((e) => e.status === "available");
  const alerts = store.notifs.filter((n) => n.unread);
  const lastResult = EXAMS.find((e) => e.id === "ex3")?.storedResult;

  return (
    <div className="space-y-8">
      {/* الترحيب */}
      <div className="dark-zone anim-fade-up relative overflow-hidden rounded-2xl bg-ink-900 p-7 sm:p-8">
        <div className="absolute inset-0 bg-dots-dark opacity-40" />
        <div className="absolute -end-16 -top-16 size-52 rounded-full bg-primary-600/30 blur-[80px]" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="font-code text-xs font-semibold text-accent-300" dir="ltr">$ welcome --user {user?.username}</p>
            <h1 className="font-display mt-2 text-2xl font-extrabold text-white sm:text-3xl">مرحبًا بعودتك، {user?.name.split(" ")[0]} 👋</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone="ink" className="border border-ink-700"><IcCap size={13} /> {user?.level} — المجموعة {user?.group}</Chip>
              <Chip tone="ink" className="border border-ink-700"><IcCalendar size={13} /> {fmtDate(new Date().toISOString())}</Chip>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: available.length, l: "متاح الآن", c: "text-emerald-300" },
              { v: store.articles.filter((a) => a.status === "review").length + store.projects.filter((p) => p.status === "review").length, l: "قيد المراجعة", c: "text-amber-300" },
              { v: store.articles.filter((a) => a.status === "published").length + store.projects.filter((p) => p.status === "published").length, l: "منشور", c: "text-accent-300" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-ink-700 bg-ink-800/50 px-4 py-3 text-center">
                <p className={cx("font-display text-2xl font-black", s.c)}>{s.v}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-ink-400">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* التنبيهات */}
      {alerts.length > 0 && (
        <section aria-label="تنبيهات">
          <div className="space-y-2.5">
            {alerts.map((n) => (
              <div key={n.id} className="anim-fade-up flex items-start gap-3.5 rounded-xl border border-primary-200 border-s-4 border-s-primary-500 bg-white p-4 shadow-sm">
                <span className={cx("mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg",
                  n.type === "exam" ? "bg-emerald-100 text-emerald-600" : n.type === "result" ? "bg-gold-400/25 text-gold-600" : n.type === "edit" ? "bg-orange-100 text-orange-600" : "bg-primary-100 text-primary-600")}>
                  {n.type === "exam" ? <IcPlay size={17} /> : n.type === "result" ? <IcTrophy size={17} /> : n.type === "edit" ? <IcPencil size={17} /> : <IcCheckCircle size={17} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink-800">{n.title}</p>
                  <p className="mt-0.5 text-[13.5px] leading-6 text-ink-500">{n.desc}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    aria-label="إخفاء التنبيه"
                    onClick={() => { store.notifs.find((x) => x.id === n.id)!.unread = false; setTick((t) => t + 1); }}
                    className="text-ink-300 transition-colors hover:text-ink-600"
                  >
                    <span className="font-code text-base" aria-hidden>✕</span>
                  </button>
                  {n.type === "exam" && <Link to="/student/exams" className="text-xs font-bold text-primary-600 hover:underline">الذهاب للامتحانات</Link>}
                  {n.type === "result" && <Link to="/student/exams/ex3/result" className="text-xs font-bold text-primary-600 hover:underline">عرض النتيجة</Link>}
                  {n.type === "edit" && <Link to="/student/articles/a5" className="text-xs font-bold text-primary-600 hover:underline">فتح المقال</Link>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* الامتحانات */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-ink-900">امتحاناتك</h2>
          <Link to="/student/exams" className="text-sm font-bold text-primary-600 hover:underline">عرض الكل</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {myExams.slice(0, 4).map((e) => (
            <Card key={e.id} hover className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2"><ExamPill status={e.status} /><Chip tone="neutral">{e.type}</Chip></div>
                  <h3 className="font-display mt-2.5 truncate text-[16px] font-bold text-ink-900">{e.title}</h3>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold text-ink-400">
                    <span className="flex items-center gap-1.5"><IcClock size={14} /> {e.durationMin} دقيقة</span>
                    <span className="flex items-center gap-1.5"><IcDoc size={14} /> {e.questions.length} أسئلة</span>
                    <span className="flex items-center gap-1.5"><IcCalendar size={14} /> حتى {fmtDate(e.end)}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-4">
                {e.status === "available" && (
                  <>
                    <span className="relative flex size-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" /></span>
                    <Link to={`/student/exams/${e.id}/take`} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white transition-all hover:bg-primary-700 active:scale-[.98]">
                      <IcPlay size={17} /> ابدأ الآن
                    </Link>
                  </>
                )}
                {e.status === "upcoming" && (
                  <span className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-sky-50 px-4 text-sm font-bold text-sky-700">
                    <IcCalendar size={16} /> يبدأ بعد {daysUntil(e.start)} {daysUntil(e.start) === 1 ? "يوم" : "أيام"} — {fmtDate(e.start)}
                  </span>
                )}
                {e.status === "completed" && (
                  e.resultPolicy === "manual" && !loadJSON(`aie.result.${e.id}`) ? (
                    <span className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-ink-100 px-4 text-sm font-bold text-ink-500">
                      <IcClock size={16} /> النتائج ستُنشر لاحقًا
                    </span>
                  ) : (
                    <Link to={`/student/exams/${e.id}/result`} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition-all hover:bg-emerald-700">
                      <IcTrophy size={16} /> عرض النتيجة {e.storedResult && <span className="font-code" dir="ltr">({e.storedResult.score}/{e.storedResult.total})</span>}
                    </Link>
                  )
                )}
                {e.status === "ended" && (
                  <span className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-ink-100 px-4 text-sm font-bold text-ink-500">
                    <IcFlag size={16} /> انتهت فترة هذا الامتحان
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* آخر نتيجة + أعمالي */}
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          {lastResult && (
            <Card className="dark-zone relative overflow-hidden p-6">
              <div className="absolute inset-0 bg-dots-dark opacity-40" />
              <div className="relative">
                <p className="font-code text-xs text-accent-300">// آخر_نتيجة</p>
                <div className="mt-3 flex items-center gap-4">
                  <p className="font-display text-5xl font-black text-white" dir="ltr">{lastResult.score}<span className="text-xl text-ink-400">/{lastResult.total}</span></p>
                  <div>
                    <p className="font-display font-bold text-white">الامتحان التشخيصي</p>
                    <p className="mt-1 text-xs text-ink-400">{fmtDate(lastResult.finishedAt)} · 80%</p>
                  </div>
                </div>
                <Link to="/student/exams/ex3/result" className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-accent-400 px-5 text-sm font-bold text-ink-950 transition-colors hover:bg-accent-300">
                  التصحيح التفصيلي <IcExternal size={15} />
                </Link>
              </div>
            </Card>
          )}
          <Card className="p-6">
            <h3 className="font-display text-base font-bold text-ink-900">حالة أعمالك</h3>
            <div className="mt-4 space-y-3">
              {(["published", "review", "changes", "draft", "rejected"] as const).map((s) => {
                const count = store.articles.filter((a) => a.status === s).length + store.projects.filter((p) => p.status === s).length;
                const m = { published: { l: "منشور", c: "bg-emerald-500", w: "100%" }, review: { l: "قيد المراجعة", c: "bg-amber-500", w: "66%" }, changes: { l: "يحتاج تعديلًا", c: "bg-orange-500", w: "50%" }, draft: { l: "مسودة", c: "bg-ink-400", w: "33%" }, rejected: { l: "مرفوض", c: "bg-rose-500", w: "20%" } }[s];
                return (
                  <div key={s} className="flex items-center gap-3">
                    <span className={cx("size-2.5 rounded-full", m.c)} />
                    <span className="w-28 text-[13px] font-bold text-ink-600">{m.l}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <div className={cx("h-full rounded-full", m.c)} style={{ width: count > 0 ? m.w : "0%", opacity: 0.85 }} />
                    </div>
                    <span className="w-6 text-end font-code text-sm font-bold text-ink-700">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-ink-900">أحدث مقالاتي</h3>
              <div className="flex gap-2">
                <Link to="/student/articles/new" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 text-[13px] font-bold text-white transition-colors hover:bg-primary-700"><IcPlus size={15} /> مقال جديد</Link>
                <Link to="/student/articles" className="inline-flex h-9 items-center rounded-lg border border-ink-200 px-3 text-[13px] font-bold text-ink-500 hover:border-primary-300 hover:text-primary-700">الكل</Link>
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              {store.articles.slice(0, 3).map((a) => (
                <Link key={a.id} to={`/student/articles/${a.id}/edit`} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 transition-all hover:border-primary-300 hover:bg-primary-50/40">
                  <CoverImg src={a.cover} alt="" icon="doc" className="h-12 w-16 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-800">{a.title}</p>
                    <p className="mt-0.5 text-xs text-ink-400">آخر تحديث {timeAgo(a.date)}</p>
                  </div>
                  <StatusPill status={a.status} />
                </Link>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-ink-900">أحدث مشاريعي</h3>
              <div className="flex gap-2">
                <Link to="/student/projects/new" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 text-[13px] font-bold text-white transition-colors hover:bg-primary-700"><IcPlus size={15} /> مشروع جديد</Link>
                <Link to="/student/projects" className="inline-flex h-9 items-center rounded-lg border border-ink-200 px-3 text-[13px] font-bold text-ink-500 hover:border-primary-300 hover:text-primary-700">الكل</Link>
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              {store.projects.slice(0, 3).map((p) => (
                <Link key={p.id} to={`/student/projects/${p.id}/edit`} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 transition-all hover:border-primary-300 hover:bg-primary-50/40">
                  <CoverImg src={p.cover} alt="" className="h-12 w-16 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-800">{p.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-400">
                      {p.kind === "جماعي" ? <span className="flex items-center gap-1"><IcUsers size={12} /> {p.members.length} أعضاء</span> : "عمل فردي"} · {timeAgo(p.date)}
                    </p>
                  </div>
                  <StatusPill status={p.status} />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* آخر المنشورات العامة */}
      <section>
        <h2 className="font-display mb-4 text-xl font-extrabold text-ink-900">جديد الواجهة العامة</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ARTICLES.filter((a) => a.status === "published").slice(0, 2).map((a) => (
            <Link key={a.id} to={`/articles/${a.id}`} className="group flex gap-4 rounded-xl border border-ink-200 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md">
              <CoverImg src={a.cover} alt="" icon="doc" className="h-16 w-24 shrink-0 rounded-lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-800 group-hover:text-primary-700">{a.title}</p>
                <p className="mt-1 text-xs text-ink-400">{a.author.name} · {fmtDate(a.date)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ============ قائمة الامتحانات ============ */

export function StudentExamsPage() {
  usePageTitle("الامتحانات");
  const exams = EXAMS.filter((e) => e.status !== "draft");
  return (
    <div>
      <PageHead title="الامتحانات" desc="كل امتحانات مستواك في مكان واحد — المتاح أولًا." />
      <div className="mb-6 flex flex-wrap gap-2 text-[13px] font-semibold text-ink-500">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> متاح: يمكنك البدء الآن</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-sky-500" /> قادم: يُفتح في تاريخه</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary-500" /> مكتمل: نتيجته متاحة</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-ink-400" /> منتهٍ: أُغلق نهائيًا</span>
      </div>
      <div className="space-y-4">
        {exams.map((e, i) => (
          <Card key={e.id} hover className="anim-fade-up p-5" >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-code grid size-9 place-items-center rounded-lg bg-ink-900 text-xs font-bold text-accent-300">{String(i + 1).padStart(2, "0")}</span>
                  <ExamPill status={e.status} />
                  <Chip tone="neutral">{e.type}</Chip>
                </div>
                <h2 className="font-display mt-2.5 text-lg font-bold text-ink-900">{e.title}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-500">{e.desc}</p>
                <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[13px] font-semibold text-ink-400">
                  <span className="flex items-center gap-1.5"><IcClock size={14} /> {e.durationMin} دقيقة</span>
                  <span className="flex items-center gap-1.5"><IcDoc size={14} /> {e.questions.length} أسئلة</span>
                  <span className="flex items-center gap-1.5"><IcCalendar size={14} /> من {fmtDate(e.start)} إلى {fmtDate(e.end)}</span>
                  <span className="flex items-center gap-1.5"><IcKey size={14} /> محاولة واحدة</span>
                </div>
              </div>
              <div className="shrink-0 lg:w-56">
                {e.status === "available" && (
                  <Link to={`/student/exams/${e.id}/take`} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white transition-all hover:bg-primary-700 active:scale-[.98]">
                    <IcPlay size={17} /> ابدأ الامتحان
                  </Link>
                )}
                {e.status === "upcoming" && (
                  <div className="rounded-lg bg-sky-50 px-4 py-2.5 text-center text-sm font-bold text-sky-700">
                    يفتح بعد {daysUntil(e.start)} {daysUntil(e.start) === 1 ? "يوم" : "أيام"}
                  </div>
                )}
                {e.status === "completed" && (
                  e.resultPolicy === "manual" && !loadJSON(`aie.result.${e.id}`) ? (
                    <div className="rounded-lg bg-ink-100 px-4 py-2.5 text-center text-sm font-bold text-ink-500">النتائج قريبًا</div>
                  ) : (
                    <Link to={`/student/exams/${e.id}/result`} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition-all hover:bg-emerald-700">
                      <IcTrophy size={16} /> عرض النتيجة
                    </Link>
                  )
                )}
                {e.status === "ended" && <div className="rounded-lg bg-ink-100 px-4 py-2.5 text-center text-sm font-bold text-ink-500">انتهى — {fmtDate(e.end)}</div>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============ محرر المحتوى المشترك ============ */

const COVER_OPTIONS = [COVERS.binary, COVERS.python, COVERS.network, COVERS.robot, COVERS.app, COVERS.game];

function CoverPicker({ value, onChange }: { value?: string; onChange: (v?: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        aria-pressed={!value}
        className={cx("grid h-16 place-items-center rounded-lg border-2 text-[11px] font-bold transition-all", !value ? "border-primary-500 bg-primary-50 text-primary-700" : "border-ink-200 text-ink-400 hover:border-primary-300")}
      >
        بدون غلاف
      </button>
      {COVER_OPTIONS.map((c) => (
        <button key={c} type="button" onClick={() => onChange(c)} aria-pressed={value === c} className={cx("h-16 overflow-hidden rounded-lg border-2 transition-all", value === c ? "border-primary-500 ring-2 ring-primary-200" : "border-transparent opacity-80 hover:opacity-100")}>
          <CoverImg src={c} alt="خيار غلاف" className="h-full w-full" />
        </button>
      ))}
    </div>
  );
}

function ArticleEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  usePageTitle(id ? "تعديل المقال" : "مقال جديد");
  const existing = id === "new" ? undefined : store.articles.find((a) => a.id === id);
  const [form, setForm] = useState({
    title: existing?.title ?? "",
    summary: existing?.summary ?? "",
    body: existing?.body?.join("\n\n") ?? "",
    cover: existing?.cover,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmSend, setConfirmSend] = useState(false);
  const status = existing?.status ?? "draft";

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 5) e.title = "العنوان قصير جدًا — 5 أحرف على الأقل.";
    if (form.summary.trim().length < 20) e.summary = "اكتب ملخصًا من 20 حرفًا على الأقل.";
    if (form.body.trim().length < 50) e.body = "المحتوى قصير جدًا — 50 حرفًا على الأقل.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = (send: boolean) => {
    if (!validate()) {
      toast.push({ tone: "error", title: "تحقق من الحقول", desc: "بعض الحقول تحتاج إلى مراجعة قبل المتابعة." });
      return;
    }
    const now = new Date().toISOString();
    if (existing) {
      existing.title = form.title.trim();
      existing.summary = form.summary.trim();
      existing.body = form.body.split("\n\n");
      existing.cover = form.cover;
      existing.date = now;
      if (send) existing.status = "review";
    } else {
      store.articles.unshift({
        id: `a-new-${Date.now()}`,
        title: form.title.trim(),
        summary: form.summary.trim(),
        body: form.body.split("\n\n"),
        cover: form.cover,
        author: { name: "أمينة ب.", level: "الثالثة إعدادي" },
        date: now,
        readMin: Math.max(2, Math.round(form.body.length / 900)),
        status: send ? "review" : "draft",
        tags: ["جديد"],
        owner: true,
      });
    }
    if (send) {
      toast.push({ tone: "success", title: "أُرسل للمراجعة", desc: "سيراجع الأستاذ مقالك ويصلك إشعار بالقرار." });
      navigate("/student/articles");
    } else {
      toast.push({ tone: "success", title: "حُفظت المسودة", desc: "يمكنك العودة إليها في أي وقت." });
    }
  };

  return (
    <div className="max-w-3xl">
      <Link to="/student/articles" className="text-sm font-bold text-primary-600 hover:underline">← العودة إلى مقالاتي</Link>
      <PageHead title={id === "new" ? "مقال جديد" : "تعديل المقال"} action={<StatusPill status={status} />} />

      {(status === "changes" || status === "rejected") && existing?.note && (
        <div className="mb-6">
          <Alert tone={status === "rejected" ? "danger" : "warning"} title={status === "rejected" ? "ملاحظة الأستاذ حول الرفض" : "ملاحظات الأستاذ للتعديل"}>
            {existing.note}
          </Alert>
        </div>
      )}
      {status === "review" && (
        <div className="mb-6">
          <Alert tone="info" title="قيد المراجعة">مقالك لدى الأستاذ الآن. يمكنك تعديله، وسيُعاد إرساله للمراجعة عند الحفظ.</Alert>
        </div>
      )}

      <Card className="space-y-5 p-6 sm:p-7">
        <Field label="عنوان المقال" required error={errors.title} hint="عنوان واضح وجذاب — 5 أحرف على الأقل.">
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={!!errors.title} placeholder="مثال: النظام الثنائي ببساطة" />
        </Field>
        <Field label="الملخص" required error={errors.summary} hint={`${form.summary.length}/200 — يظهر في بطاقة المقال.`}>
          <TextArea rows={2} maxLength={200} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} error={!!errors.summary} placeholder="سطر أو سطران يلخصان فكرة المقال…" />
        </Field>
        <Field label="صورة الغلاف" hint="اختيارية — المقالات بدون غلاف تحصل على غلاف تقني أنيق تلقائيًا.">
          <CoverPicker value={form.cover} onChange={(v) => setForm({ ...form, cover: v })} />
        </Field>
        <Field label="محتوى المقال" required error={errors.body} hint="اكتب بالعربية الفصيحة المبسطة. فقرات قصيرة أفضل للقراءة.">
          <div className="mb-2 flex gap-2">
            {[
              { l: "## عنوان فرعي", v: "\n\n## عنوان فرعي\n" },
              { l: "• قائمة", v: "\n- عنصر أول\n- عنصر ثانٍ" },
              { l: "</> كود", v: "\n```\nprint('مرحبًا')\n```" },
            ].map((b) => (
              <button key={b.l} type="button" onClick={() => setForm({ ...form, body: form.body + b.v })} className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-1.5 font-code text-xs font-semibold text-ink-500 transition-colors hover:border-primary-300 hover:text-primary-700">
                {b.l}
              </button>
            ))}
          </div>
          <TextArea rows={9} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} error={!!errors.body} placeholder="ابدأ الكتابة هنا…" className="leading-8" />
        </Field>
        <div className="flex flex-wrap gap-3 border-t border-ink-100 pt-5">
          <Btn v="outline" onClick={() => save(false)}>حفظ كمسودة</Btn>
          <Btn icon={<IcSend size={17} />} onClick={() => setConfirmSend(true)}>
            {status === "changes" || status === "rejected" ? "إعادة الإرسال للمراجعة" : "إرسال للمراجعة"}
          </Btn>
          {status === "published" && (
            <Link to={`/articles/${existing?.id}`} className="inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold text-primary-600 hover:text-primary-700">
              <IcEye size={17} /> عرض الصفحة المنشورة
            </Link>
          )}
        </div>
      </Card>

      <Confirm
        open={confirmSend}
        onClose={() => setConfirmSend(false)}
        onYes={() => save(true)}
        title="إرسال المقال للمراجعة"
        desc="سيتلقى الأستاذ إشعارًا لمراجعة مقالك. بعد الموافقة يُنشر في الواجهة العامة باسم العرض الآمن الخاص بك."
        yesLabel="نعم، إرسال"
      />
    </div>
  );
}

/* ============ قائمة مقالات التلميذ ============ */

export function StudentArticlesPage() {
  usePageTitle("مقالاتي");
  const [, setTick] = useState(0);
  const [filter, setFilter] = useState("الكل");
  const statuses = ["الكل", "مسودة", "قيد المراجعة", "يحتاج تعديلًا", "مرفوض", "منشور"] as const;
  const map: Record<string, Article["status"]> = { "مسودة": "draft", "قيد المراجعة": "review", "يحتاج تعديلًا": "changes", "مرفوض": "rejected", "منشور": "published" };
  const list = store.articles.filter((a) => filter === "الكل" || a.status === map[filter]);

  return (
    <div>
      <PageHead
        title="مقالاتي"
        desc="اكتب، أرسل للمراجعة، وانشر — كل مقالك يمر بمراجعة الأستاذ قبل الظهور العام."
        action={<Link to="/student/articles/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-bold text-white transition-colors hover:bg-primary-700"><IcPlus size={17} /> مقال جديد</Link>}
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={cx("rounded-lg px-3.5 py-2 text-[13px] font-bold transition-all", filter === s ? "bg-ink-900 text-white" : "border border-ink-200 bg-white text-ink-500 hover:border-primary-300 hover:text-primary-700")}>
            {s} <span className="opacity-60">({s === "الكل" ? store.articles.length : store.articles.filter((a) => a.status === map[s]).length})</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<IcDoc size={30} />} title="لا توجد مقالات بهذه الحالة" desc="جرّب حالة أخرى أو أنشئ مقالًا جديدًا — الكتابة أفضل طريقة للفهم." action={<Link to="/student/articles/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-bold text-white"><IcPlus size={16} /> مقال جديد</Link>} />
      ) : (
        <div className="space-y-4">
          {list.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <CoverImg src={a.cover} alt="" icon="doc" className="h-24 w-full shrink-0 rounded-lg sm:w-36" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-[16px] font-bold text-ink-900">{a.title}</h2>
                    <StatusPill status={a.status} />
                  </div>
                  <p className="mt-1 clamp-2 text-sm leading-6 text-ink-500">{a.summary}</p>
                  <p className="mt-1.5 text-xs font-semibold text-ink-400">آخر تحديث {timeAgo(a.date)}</p>
                  {a.note && (a.status === "changes" || a.status === "rejected") && (
                    <p className={cx("mt-2 rounded-lg px-3 py-2 text-[13px] leading-6", a.status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-orange-50 text-orange-700")}>
                      <strong>ملاحظة الأستاذ:</strong> {a.note}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link to={`/student/articles/${a.id}/edit`} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-4 text-[13px] font-bold text-ink-600 transition-all hover:border-primary-400 hover:text-primary-700">
                    <IcPencil size={15} /> {a.status === "changes" || a.status === "rejected" ? "تعديل وإعادة إرسال" : "تعديل"}
                  </Link>
                  {a.status === "published" && (
                    <Link to={`/articles/${a.id}`} className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-bold text-primary-600 hover:text-primary-700">
                      <IcExternal size={15} /> الصفحة العامة
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <span className="hidden">{setTick.name}</span>
    </div>
  );
}

/* ============ مشاريع التلميذ ============ */

export function StudentProjectsPage() {
  usePageTitle("مشاريعي");
  const [filter, setFilter] = useState("الكل");
  const map: Record<string, Project["status"]> = { "مسودة": "draft", "قيد المراجعة": "review", "يحتاج تعديلًا": "changes", "مرفوض": "rejected", "منشور": "published" };
  const list = store.projects.filter((p) => filter === "الكل" || p.status === map[filter]);
  const statuses = ["الكل", "مسودة", "قيد المراجعة", "يحتاج تعديلًا", "مرفوض", "منشور"];

  return (
    <div>
      <PageHead
        title="مشاريعي"
        desc="مشاريعك الفردية والجماعية — راجع الحالة وملاحظات الأستاذ من هنا."
        action={<Link to="/student/projects/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-bold text-white transition-colors hover:bg-primary-700"><IcPlus size={17} /> مشروع جديد</Link>}
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={cx("rounded-lg px-3.5 py-2 text-[13px] font-bold transition-all", filter === s ? "bg-ink-900 text-white" : "border border-ink-200 bg-white text-ink-500 hover:border-primary-300 hover:text-primary-700")}>
            {s} <span className="opacity-60">({s === "الكل" ? store.projects.length : store.projects.filter((p) => p.status === map[s]).length})</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<IcProject size={30} />} title="لا توجد مشاريع بهذه الحالة" desc="ابدأ مشروعًا جديدًا — فرديًا أو مع فريق من قسمك." action={<Link to="/student/projects/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-bold text-white"><IcPlus size={16} /> مشروع جديد</Link>} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {list.map((p) => (
            <Card key={p.id} hover className="overflow-hidden">
              <div className="relative h-40">
                <CoverImg src={p.cover} alt="" className="h-full w-full" />
                <span className={cx("absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm", p.kind === "جماعي" ? "bg-accent-400/90 text-ink-950" : "bg-gold-400/90 text-ink-950")}>
                  {p.kind === "جماعي" ? <IcUsers size={12} /> : <IcUser size={12} />} {p.kind}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-[16px] font-bold text-ink-900">{p.title}</h2>
                  <StatusPill status={p.status} />
                </div>
                <p className="mt-1.5 clamp-2 text-sm leading-6 text-ink-500">{p.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="flex -space-x-2">
                    {p.members.map((m) => <span key={m.name} className="rounded-full ring-2 ring-white"><Avatar name={m.name} size={24} /></span>)}
                  </span>
                  <span className="text-xs font-bold text-ink-500">{p.members.map((m) => m.name).join("، ")}</span>
                  <span className="ms-auto text-xs text-ink-400">{timeAgo(p.date)}</span>
                </div>
                {p.note && (p.status === "changes" || p.status === "rejected") && (
                  <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-[13px] leading-6 text-orange-700"><strong>ملاحظة الأستاذ:</strong> {p.note}</p>
                )}
                <div className="mt-4 flex gap-2 border-t border-ink-100 pt-4">
                  <Link to={`/student/projects/${p.id}/edit`} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white px-4 text-[13px] font-bold text-ink-600 transition-all hover:border-primary-400 hover:text-primary-700">
                    <IcPencil size={15} /> {p.status === "changes" || p.status === "rejected" ? "تعديل وإعادة إرسال" : "تعديل"}
                  </Link>
                  {p.status === "published" && (
                    <Link to={`/projects/${p.id}`} className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-bold text-primary-600 hover:text-primary-700">
                      <IcExternal size={15} /> الصفحة العامة
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  usePageTitle(id === "new" ? "مشروع جديد" : "تعديل المشروع");
  const existing = id === "new" ? undefined : store.projects.find((p) => p.id === id);
  const [form, setForm] = useState({
    title: existing?.title ?? "",
    summary: existing?.summary ?? "",
    body: existing?.body?.join("\n\n") ?? "",
    cover: existing?.cover,
    kind: existing?.kind ?? ("جماعي" as Project["kind"]),
    members: existing?.members.map((m) => m.name) ?? ([] as string[]),
    link: existing?.link?.url ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmSend, setConfirmSend] = useState(false);
  const status = existing?.status ?? "draft";

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 5) e.title = "العنوان قصير جدًا.";
    if (form.summary.trim().length < 20) e.summary = "اكتب ملخصًا من 20 حرفًا على الأقل.";
    if (form.kind === "جماعي" && form.members.length === 0) e.members = "اختر عضوًا واحدًا على الأقل للفريق.";
    if (form.link && !form.link.startsWith("https://")) e.link = "الرابط يجب أن يبدأ بـ https://";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = (send: boolean) => {
    if (!validate()) {
      toast.push({ tone: "error", title: "تحقق من الحقول", desc: "بعض الحقول تحتاج إلى مراجعة." });
      return;
    }
    const now = new Date().toISOString();
    const members = form.kind === "فردي" ? [{ name: "أمينة ب.", role: "إنجاز" }] : form.members.map((n) => ({ name: n === "أمينة بنعلي" ? "أمينة ب." : n, role: "عضو" }));
    if (existing) {
      Object.assign(existing, { title: form.title.trim(), summary: form.summary.trim(), body: form.body.split("\n\n"), cover: form.cover, kind: form.kind, members, date: now, link: form.link ? { url: form.link, label: "رابط المشروع", verified: existing.link?.verified ?? false } : undefined });
      if (send) existing.status = "review";
    } else {
      store.projects.unshift({
        id: `p-new-${Date.now()}`, title: form.title.trim(), summary: form.summary.trim(), body: form.body.split("\n\n"),
        cover: form.cover, members, date: now, kind: form.kind, level: "الثالثة إعدادي", status: send ? "review" : "draft",
        tech: ["جديد"], owner: true, link: form.link ? { url: form.link, label: "رابط المشروع", verified: false } : undefined,
      });
    }
    if (send) {
      toast.push({ tone: "success", title: "أُرسل المشروع للمراجعة", desc: "سيراجعه الأستاذ ويصلك إشعار بالقرار." });
      navigate("/student/projects");
    } else {
      toast.push({ tone: "success", title: "حُفظت المسودة" });
    }
  };

  return (
    <div className="max-w-3xl">
      <Link to="/student/projects" className="text-sm font-bold text-primary-600 hover:underline">← العودة إلى مشاريعي</Link>
      <PageHead title={id === "new" ? "مشروع جديد" : "تعديل المشروع"} action={<StatusPill status={status} />} />
      {(status === "changes" || status === "rejected") && existing?.note && (
        <div className="mb-6"><Alert tone="warning" title="ملاحظات الأستاذ">{existing.note}</Alert></div>
      )}
      <Card className="space-y-5 p-6 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
          <Field label="عنوان المشروع" required error={errors.title}>
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={!!errors.title} placeholder="مثال: روبوت الفرز الذكي" />
          </Field>
          <Field label="نوع العمل">
            <div className="flex h-11 gap-2">
              {(["فردي", "جماعي"] as const).map((k) => (
                <button key={k} type="button" onClick={() => setForm({ ...form, kind: k })} aria-pressed={form.kind === k}
                  className={cx("flex-1 rounded-lg border-2 px-4 text-sm font-bold transition-all sm:w-28", form.kind === k ? "border-primary-500 bg-primary-50 text-primary-700" : "border-ink-200 text-ink-500 hover:border-primary-300")}>
                  {k}
                </button>
              ))}
            </div>
          </Field>
        </div>
        {form.kind === "جماعي" && (
          <Field label="أعضاء الفريق" required error={errors.members} hint="اختر من تلاميذ قسمك — سيظهر المشروع بأسماء العرض الآمنة للجميع.">
            <div className="flex flex-wrap gap-2">
              {CLASSMATES.map((c) => {
                const on = form.members.includes(c);
                return (
                  <button key={c} type="button" aria-pressed={on}
                    onClick={() => setForm({ ...form, members: on ? form.members.filter((x) => x !== c) : [...form.members, c] })}
                    className={cx("inline-flex items-center gap-2 rounded-lg border-2 px-3.5 py-2 text-sm font-bold transition-all", on ? "border-primary-500 bg-primary-50 text-primary-700" : "border-ink-200 text-ink-500 hover:border-primary-300")}>
                    <Avatar name={c} size={22} /> {c} {on && <IcCheck size={14} />}
                  </button>
                );
              })}
            </div>
          </Field>
        )}
        <Field label="الملخص" required error={errors.summary}>
          <TextArea rows={2} maxLength={200} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} error={!!errors.summary} placeholder="ما الفكرة؟ وماذا ينجز المشروع؟" />
        </Field>
        <Field label="صورة الغلاف">
          <CoverPicker value={form.cover} onChange={(v) => setForm({ ...form, cover: v })} />
        </Field>
        <Field label="وصف المشروع وتجربته">
          <TextArea rows={7} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="احكِ قصة المشروع: الفكرة، الأدوات، الصعوبات، والنتيجة…" className="leading-8" />
        </Field>
        <Field label="رابط خارجي (عرض، فيديو، مستودع…)" error={errors.link} hint="اختياري — يجب أن يبدأ بـ https:// وسيتحقق منه الأستاذ قبل اعتماده.">
          <TextInput dir="ltr" className="text-start font-code" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} error={!!errors.link} placeholder="https://example.com/demo" />
        </Field>
        <div className="flex flex-wrap gap-3 border-t border-ink-100 pt-5">
          <Btn v="outline" onClick={() => save(false)}>حفظ كمسودة</Btn>
          <Btn icon={<IcSend size={17} />} onClick={() => setConfirmSend(true)}>
            {status === "changes" || status === "rejected" ? "إعادة الإرسال للمراجعة" : "إرسال للمراجعة"}
          </Btn>
        </div>
      </Card>
      <Confirm open={confirmSend} onClose={() => setConfirmSend(false)} onYes={() => save(true)} title="إرسال المشروع للمراجعة" desc="سيراجع الأستاذ المشروع (والرابط الخارجي إن وُجد) قبل النشر العام." yesLabel="نعم، إرسال" />
    </div>
  );
}

/* ============ الملف الشخصي ============ */

export function StudentProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  usePageTitle("ملفي الشخصي");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoutOpen, setLogoutOpen] = useState(false);

  const changePw = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (pw.current !== "1234") errs.current = "كلمة المرور الحالية غير صحيحة.";
    if (pw.next.length < 6) errs.next = "كلمة المرور الجديدة قصيرة — 6 رموز على الأقل.";
    if (pw.confirm !== pw.next) errs.confirm = "التأكيد لا يطابق كلمة المرور الجديدة.";
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setPw({ current: "", next: "", confirm: "" });
      toast.push({ tone: "success", title: "غُيّرت كلمة المرور", desc: "استعمل الكلمة الجديدة في دخولك القادم." });
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHead title="ملفي الشخصي" desc="بياناتك الأساسية وإعدادات الأمان." />
      <Card className="p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name ?? ""} size={64} />
          <div>
            <p className="font-display text-xl font-extrabold text-ink-900">{user?.name}</p>
            <p className="mt-1 text-sm text-ink-500">{user?.level} — المجموعة {user?.group}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { l: "الاسم الكامل", v: user?.name },
            { l: "اسم المستخدم", v: user?.username, mono: true },
            { l: "المستوى", v: user?.level },
            { l: "المجموعة", v: `المجموعة ${user?.group}` },
          ].map((r) => (
            <div key={r.l} className="rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-3">
              <dt className="text-xs font-bold text-ink-400">{r.l}</dt>
              <dd className={cx("mt-1 text-[15px] font-bold text-ink-800", r.mono && "font-code")} dir={r.mono ? "ltr" : undefined}>{r.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 flex items-center gap-2 text-xs text-ink-400"><IcInfo size={14} /> لتعديل بياناتك الأساسية، تواصل مع أستاذك — حمايةً لحسابك.</p>
      </Card>

      <Card className="p-6 sm:p-7">
        <h2 className="font-display flex items-center gap-2 text-lg font-bold text-ink-900"><IcKey size={20} className="text-primary-600" /> تغيير كلمة المرور</h2>
        <form onSubmit={changePw} className="mt-5 space-y-4" noValidate>
          <Field label="كلمة المرور الحالية" required error={errors.current}>
            <TextInput type="password" dir="ltr" className="text-start font-code" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} error={!!errors.current} placeholder="••••••••" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="كلمة المرور الجديدة" required error={errors.next} hint="6 رموز على الأقل.">
              <TextInput type="password" dir="ltr" className="text-start font-code" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} error={!!errors.next} placeholder="••••••••" />
            </Field>
            <Field label="تأكيد كلمة المرور" required error={errors.confirm}>
              <TextInput type="password" dir="ltr" className="text-start font-code" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} error={!!errors.confirm} placeholder="••••••••" />
            </Field>
          </div>
          <Btn type="submit">حفظ كلمة المرور الجديدة</Btn>
        </form>
        <p className="mt-3 text-xs text-ink-400">للعرض التجريبي: كلمة المرور الحالية هي 1234.</p>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3 border-rose-200 p-6">
        <div>
          <p className="font-display font-bold text-ink-800">تسجيل الخروج</p>
          <p className="mt-0.5 text-sm text-ink-500">جلستك تنتهي تلقائيًا بعد 45 دقيقة من الدخول.</p>
        </div>
        <Btn v="danger" icon={<IcLogout size={17} />} onClick={() => setLogoutOpen(true)}>تسجيل الخروج</Btn>
      </Card>
      <Confirm open={logoutOpen} onClose={() => setLogoutOpen(false)} onYes={() => { logout(); navigate("/"); }} title="تسجيل الخروج" desc="هل تريد مغادرة فضاء التلميذ الآن؟ تقدمك محفوظ." yesLabel="نعم، خروج" tone="danger" />
    </div>
  );
}

/* ============ الإشعارات ============ */

const NOTIF_ICON: Record<string, { Icon: typeof IcPlay; cls: string }> = {
  exam: { Icon: IcPlay, cls: "bg-emerald-100 text-emerald-600" },
  result: { Icon: IcTrophy, cls: "bg-gold-400/25 text-gold-600" },
  edit: { Icon: IcPencil, cls: "bg-orange-100 text-orange-600" },
  publish: { Icon: IcCheckCircle, cls: "bg-primary-100 text-primary-600" },
  info: { Icon: IcInfo, cls: "bg-sky-100 text-sky-600" },
};

export function StudentNotificationsPage() {
  usePageTitle("الإشعارات");
  const [, setTick] = useState(0);
  const toast = useToast();
  const unread = store.notifs.filter((n) => n.unread).length;

  return (
    <div className="max-w-2xl">
      <PageHead
        title="الإشعارات"
        desc="امتحانات جديدة، نتائج، وقرارات المراجعة — أولًا بأول."
        action={unread > 0 ? (
          <Btn v="outline" sm icon={<IcCheck size={15} />} onClick={() => { store.notifs.forEach((n) => (n.unread = false)); setTick((t) => t + 1); toast.push({ tone: "success", title: "قُرئت كل الإشعارات" }); }}>
            تحديد الكل كمقروء
          </Btn>
        ) : undefined}
      />
      <div className="space-y-3">
        {store.notifs.map((n) => {
          const m = NOTIF_ICON[n.type];
          const Icon = m.Icon;
          return (
            <div key={n.id} className={cx("flex items-start gap-3.5 rounded-xl border bg-white p-4 transition-all", n.unread ? "border-primary-200 border-s-4 border-s-primary-500 shadow-sm" : "border-ink-100")}>
              <span className={cx("mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl", m.cls)}><Icon size={19} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-ink-800">{n.title}</p>
                  {n.unread && <span className="size-2 rounded-full bg-primary-500" aria-label="غير مقروء" />}
                </div>
                <p className="mt-0.5 text-[13.5px] leading-6 text-ink-500">{n.desc}</p>
                <p className="mt-1 text-xs font-semibold text-ink-300">{timeAgo(n.time)}</p>
              </div>
              {n.unread && (
                <button onClick={() => { n.unread = false; setTick((t) => t + 1); }} className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-primary-600 transition-colors hover:bg-primary-50">
                  مقروء
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ موجّه صفحات التلميذ ============ */

export function StudentArticlesRouter() {
  const { id } = useParams();
  if (id) return <ArticleEditorPage />;
  return <StudentArticlesPage />;
}

export function StudentProjectsRouter() {
  const { id } = useParams();
  if (id) return <ProjectEditorPage />;
  return <StudentProjectsPage />;
}
