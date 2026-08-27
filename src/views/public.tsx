import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import {
  Counter, Reveal, cx, fmtDate, timeAgo, useAuth, usePageTitle, useScramble,
} from "../core";
import {
  ARTICLES, COVERS, MARQUEE_TOPICS, PROJECTS, type Article, type Project,
} from "../data";
import {
  Avatar, Btn, Card, Chip, CoverImg, EmptyState, Menu, Modal, SearchBox, SectionHead, Skeleton, StatusPill, useToast,
} from "../ui";
import {
  IcBook, IcCap, IcCheck, IcCheckCircle, IcAlert, IcCode, IcDoc, IcExternal, IcLock,
  IcLogout, IcMail, IcMenu, IcPhone, IcPin, IcProject, IcSend, IcShield, IcStar, IcTerminal, IcUser, IcUsers, LogoMark,
} from "../icons";

/* ============ أدوات مشتركة ============ */

function useLoaded(ms = 650) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return loaded;
}

/* ============ الترويسة والتذييل ============ */

export function PublicHeader() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navCls = ({ isActive }: { isActive: boolean }) =>
    cx(
      "relative px-3 py-2 text-[15px] font-bold transition-colors",
      isActive ? "text-primary-700" : "text-ink-500 hover:text-ink-800",
    );

  return (
    <header
      className={cx(
        "no-print sticky top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-ink-200/70 bg-white/85 shadow-sm backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark size={38} />
          <span className="leading-none">
            <span className="block font-display text-[17px] font-extrabold text-ink-900">أستاذ المعلوماتية</span>
            <span className="mt-1 block font-code text-[10px] font-medium tracking-wide text-ink-400">EDU·PLATFORM v2</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          <NavLink to="/" end className={navCls}>الرئيسية</NavLink>
          <NavLink to="/articles" className={navCls}>المقالات</NavLink>
          <NavLink to="/projects" className={navCls}>المشاريع</NavLink>
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {user?.role === "student" ? (
            <>
              <Link to="/student" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white shadow-sm shadow-primary-600/25 transition-all hover:bg-primary-700 active:scale-[.98]">
                <IcCap size={18} /> فضاء التلميذ
              </Link>
              <Menu
                align="end"
                button={
                  <button aria-label="قائمة الحساب" className="rounded-full ring-2 ring-transparent transition hover:ring-primary-200">
                    <Avatar name={user.name} size={38} />
                  </button>
                }
                items={[
                  { label: "ملفي الشخصي", icon: <IcUser size={16} />, onClick: () => (window.location.hash = "#/student/profile") },
                  { label: "تسجيل الخروج", icon: <IcLogout size={16} />, danger: true, onClick: () => { logout(); toast.push({ tone: "info", title: "تم تسجيل الخروج", desc: "نراك قريبًا!" }); } },
                ]}
              />
            </>
          ) : user?.role === "teacher" ? (
            <Link to="/teacher" className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-bold text-white transition-all hover:bg-ink-700 active:scale-[.98]">
              <IcShield size={17} /> لوحة الأستاذ
            </Link>
          ) : (
            <>
              <Link to="/teacher/login" className="rounded-lg px-3 py-2 text-sm font-bold text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-800">
                دخول الأستاذ
              </Link>
              <Link to="/login" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white shadow-sm shadow-primary-600/25 transition-all hover:bg-primary-700 active:scale-[.98]">
                تسجيل دخول التلميذ
              </Link>
            </>
          )}
        </div>

        <button
          className="grid size-10 place-items-center rounded-lg text-ink-600 transition-colors hover:bg-ink-900/5 md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="فتح القائمة"
        >
          <IcMenu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] bg-ink-950/50 backdrop-blur-[2px] anim-fade-in md:hidden" onMouseDown={(e) => e.target === e.currentTarget && setMobileOpen(false)}>
          <div className="absolute start-0 top-0 h-full w-[84%] max-w-xs bg-white p-5 shadow-2xl anim-fade-up">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2"><LogoMark size={32} /><span className="font-display font-extrabold text-ink-900">أستاذ المعلوماتية</span></div>
              <button onClick={() => setMobileOpen(false)} aria-label="إغلاق" className="grid size-9 place-items-center rounded-lg text-ink-400 hover:bg-ink-50"><span className="font-code text-lg" aria-hidden>✕</span></button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="قائمة الهاتف">
              {[
                { to: "/", label: "الرئيسية" },
                { to: "/articles", label: "المقالات" },
                { to: "/projects", label: "المشاريع" },
              ].map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cx("rounded-lg px-4 py-3 text-[15px] font-bold", isActive ? "bg-primary-50 text-primary-700" : "text-ink-600 hover:bg-ink-50")}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-2.5 border-t border-ink-100 pt-6">
              {user ? (
                <Link to={user.role === "student" ? "/student" : "/teacher"} onClick={() => setMobileOpen(false)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white">
                  {user.role === "student" ? <><IcCap size={18} /> فضاء التلميذ</> : <><IcShield size={18} /> لوحة الأستاذ</>}
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-600 px-4 text-sm font-bold text-white">تسجيل دخول التلميذ</Link>
                  <Link to="/teacher/login" onClick={() => setMobileOpen(false)} className="inline-flex h-11 items-center justify-center rounded-lg border border-ink-200 px-4 text-sm font-bold text-ink-600">دخول الأستاذ</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function FooterModal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal open={open} onClose={onClose} title={title} footer={<Btn v="outline" sm onClick={onClose}>حسنًا، فهمت</Btn>}>
      <div className="space-y-3 text-sm leading-7 text-ink-600">{children}</div>
    </Modal>
  );
}

export function PublicFooter() {
  const [modal, setModal] = useState<"" | "privacy" | "terms">("");
  return (
    <footer className="no-print dark-zone relative mt-20 overflow-hidden bg-ink-900 text-ink-300">
      <div className="absolute inset-0 bg-dots-dark opacity-40" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark size={40} />
            <div className="leading-none">
              <p className="font-display text-lg font-extrabold text-white">أستاذ المعلوماتية</p>
              <p className="mt-1 font-code text-[10px] text-ink-400">EDU·PLATFORM v2</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7">
            منصة تعليمية عربية لمادة المعلوماتية: امتحانات إلكترونية بتصحيح فوري، ومقالات ومشاريع ينجزها التلاميذ وتُراجع قبل النشر.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip tone="ink" className="border border-ink-700"><IcShield size={13} /> آمنة للقاصرين</Chip>
            <Chip tone="ink" className="border border-ink-700"><IcLock size={13} /> بدون تسجيل ذاتي</Chip>
            <Chip tone="ink" className="border border-ink-700"><IcCheck size={13} /> مراجعة قبل النشر</Chip>
          </div>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-white">روابط سريعة</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="transition-colors hover:text-accent-300" to="/">الرئيسية</Link></li>
            <li><Link className="transition-colors hover:text-accent-300" to="/articles">مقالات التلاميذ</Link></li>
            <li><Link className="transition-colors hover:text-accent-300" to="/projects">مشاريع التلاميذ</Link></li>
            <li><Link className="transition-colors hover:text-accent-300" to="/login">فضاء التلميذ</Link></li>
            <li><Link className="transition-colors hover:text-accent-300" to="/teacher/login">لوحة الأستاذ</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-white">معلومات</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><button className="transition-colors hover:text-accent-300" onClick={() => setModal("privacy")}>سياسة الخصوصية</button></li>
            <li><button className="transition-colors hover:text-accent-300" onClick={() => setModal("terms")}>شروط الاستخدام</button></li>
            <li><span className="text-ink-400">الأسئلة الشائعة — قريبًا</span></li>
            <li><span className="text-ink-400">دليل الأستاذ — قريبًا</span></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-white">تواصل معنا</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2.5"><IcMail size={16} className="text-accent-400" /><span dir="ltr">ostad.info@school.ma</span></li>
            <li className="flex items-center gap-2.5"><IcPhone size={16} className="text-accent-400" /><span dir="ltr">+212 5 22 00 00 00</span></li>
            <li className="flex items-start gap-2.5"><IcPin size={16} className="mt-0.5 shrink-0 text-accent-400" /> الثانوية التأهيلية ابن خلدون — الدار البيضاء</li>
            <li className="flex items-center gap-2.5"><IcStar size={16} className="text-accent-400" /> النادي العلمي: الأربعاء 16:00 – 18:00</li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-ink-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-[13px] text-ink-400 sm:px-6">
          <p>© 2026 منصة أستاذ المعلوماتية التعليمية — جميع الحقوق محفوظة.</p>
          <p className="font-code" dir="ltr">{"</>"} صُنعت بشغف لتلاميذ المعلوماتية</p>
        </div>
      </div>
      <FooterModal title="سياسة الخصوصية" open={modal === "privacy"} onClose={() => setModal("")}>
        <p>خصوصية التلاميذ خط أحمر في هذه المنصة:</p>
        <ul className="list-disc space-y-1.5 ps-5">
          <li>لا يظهر أي محتوى غير معتمد من الأستاذ في الواجهة العامة.</li>
          <li>تُنشر أعمال التلاميذ باسم عرض آمن (الاسم الشخصي + أول حرف من النسب).</li>
          <li>لا تُعرض النتائج أو البيانات الشخصية خارج فضاء التلميذ ولوحة الأستاذ.</li>
          <li>كلمات المرور مشفرة ولا يطلع عليها أحد بعد الإنشاء.</li>
        </ul>
      </FooterModal>
      <FooterModal title="شروط الاستخدام" open={modal === "terms"} onClose={() => setModal("")}>
        <ul className="list-disc space-y-1.5 ps-5">
          <li>الحسابات يسلّمها الأستاذ شخصيًا — لا يوجد تسجيل ذاتي.</li>
          <li>كل محتوى يُرسل للنشر يمر بمراجعة الأستاذ أولًا.</li>
          <li>يُمنع نشر أي محتوى مسيء أو بيانات شخصية للغير.</li>
          <li>الامتحانات فردية، وأي غش يؤدي إلى إلغاء المحاولة.</li>
        </ul>
      </FooterModal>
    </footer>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

/* ============ الطرفية الحية ============ */

const TERM_LINES: { t: string; c: "cmd" | "out" | "ok" }[] = [
  { t: "python tar7ib.py", c: "cmd" },
  { t: "> مرحبًا بكم في نادي المعلوماتية", c: "out" },
  { t: "run fake_khawarizmiyat --now", c: "cmd" },
  { t: "OK 8 أسئلة · 12 دقيقة · متاح الآن", c: "ok" },
  { t: "publish robot_l_farz --team", c: "cmd" },
  { t: "OK مقبول — معروض في الواجهة العامة", c: "ok" },
];

function Terminal() {
  const [li, setLi] = useState(0);
  const [ch, setCh] = useState(0);
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    if (reduced) return;
    const cur = TERM_LINES[li];
    if (!cur) {
      const id = setTimeout(() => { setLi(0); setCh(0); }, 5200);
      return () => clearTimeout(id);
    }
    if (ch < cur.t.length) {
      const id = setTimeout(() => setCh((c) => c + 1), cur.c === "cmd" ? 44 : 12);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => { setLi((l) => l + 1); setCh(0); }, cur.c === "cmd" ? 420 : 700);
    return () => clearTimeout(id);
  }, [li, ch, reduced]);

  const shown = reduced ? TERM_LINES.length : li;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-950/90 shadow-[0_30px_80px_-30px_rgba(5,11,29,0.9)]">
      <div className="flex items-center gap-2 border-b border-ink-800 bg-ink-900/80 px-4 py-3">
        <span className="size-2.5 rounded-full bg-rose-400/80" />
        <span className="size-2.5 rounded-full bg-gold-400/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
        <span className="ms-3 font-code text-[11px] text-ink-400" dir="ltr">terminal — club_informatique</span>
        <span className="ms-auto rounded bg-ink-800 px-2 py-0.5 font-code text-[10px] text-accent-300">bash</span>
      </div>
      <div className="min-h-[218px] p-5 font-code text-[13.5px] leading-7" dir="ltr">
        {TERM_LINES.slice(0, shown).map((l, i) => (
          <div key={i} className="text-left">
            {l.c === "cmd" && <span className="text-accent-400">$ </span>}
            <span className={l.c === "cmd" ? "text-ink-100" : l.c === "ok" ? "text-emerald-400" : "text-ink-400"}>{l.t}</span>
          </div>
        ))}
        {!reduced && (
          <div className="text-left">
            {li < TERM_LINES.length && TERM_LINES[li].c === "cmd" && <span className="text-accent-400">$ </span>}
            <span className="text-ink-100">{li < TERM_LINES.length ? TERM_LINES[li].t.slice(0, ch) : ""}</span>
            <span className="caret ms-0.5 inline-block h-4 w-2 translate-y-0.5 bg-accent-400" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ بطاقات المحتوى ============ */

export function ArticleCard({ a, big }: { a: Article; big?: boolean }) {
  return (
    <Card hover className="group h-full overflow-hidden">
      <Link to={`/articles/${a.id}`} className={cx("flex h-full flex-col", big && "md:grid md:grid-cols-2")}>
        <div className={cx("relative overflow-hidden", big ? "h-52 md:h-full md:min-h-[280px]" : "h-44")}>
          <CoverImg src={a.cover} alt={a.title} icon="doc" className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute start-3 top-3 rounded-md bg-ink-950/70 px-2.5 py-1 font-code text-[11px] font-semibold text-accent-300 backdrop-blur-sm">
            {a.tags[0]}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className={cx("font-display font-bold leading-7 text-ink-900 transition-colors group-hover:text-primary-700", big ? "text-xl" : "text-[17px]")}>
            {a.title}
          </h3>
          <p className={cx("mt-2 text-sm leading-6 text-ink-500", big ? "clamp-3" : "clamp-2")}>{a.summary}</p>
          <div className="mt-auto flex items-center gap-2.5 border-t border-ink-100 pt-4 text-[13px]">
            <Avatar name={a.author.name} size={30} />
            <span className="font-bold text-ink-700">{a.author.name}</span>
            <Chip tone="neutral" className="px-2 py-0.5 text-[11px]">{a.author.level}</Chip>
            <span className="ms-auto whitespace-nowrap text-xs text-ink-400">{fmtDate(a.date)} · {a.readMin} د للقراءة</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

export function ProjectCard({ p, fixedWidth }: { p: Project; fixedWidth?: boolean }) {
  return (
    <Card hover className={cx("group h-full overflow-hidden", fixedWidth && "w-[300px] shrink-0 snap-start sm:w-[340px]")}>
      <Link to={`/projects/${p.id}`} className="flex h-full flex-col">
        <div className="relative h-44 overflow-hidden">
          <CoverImg src={p.cover} alt={p.title} className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className={cx(
            "absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm",
            p.kind === "جماعي" ? "bg-accent-400/90 text-ink-950" : "bg-gold-400/90 text-ink-950",
          )}>
            {p.kind === "جماعي" ? <IcUsers size={12} /> : <IcUser size={12} />} مشروع {p.kind}
          </span>
          {p.link && (
            <span className={cx(
              "absolute end-3 top-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold backdrop-blur-sm",
              p.link.verified ? "bg-emerald-500/90 text-white" : "bg-amber-400/90 text-ink-950",
            )}>
              {p.link.verified ? <IcCheckCircle size={12} /> : <IcAlert size={12} />}
              {p.link.verified ? "رابط مُتحقَّق" : "قيد التحقق"}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-[17px] font-bold leading-7 text-ink-900 transition-colors group-hover:text-primary-700">{p.title}</h3>
          <p className="mt-2 clamp-2 text-sm leading-6 text-ink-500">{p.summary}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.tech.map((t) => (
              <span key={t} className="rounded bg-ink-900 px-2 py-0.5 font-code text-[11px] font-medium text-accent-300" dir="ltr">{t}</span>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2 border-t border-ink-100 pt-4 text-[13px]">
            <span className="flex -space-x-2">
              {p.members.map((m) => (
                <span key={m.name} className="rounded-full ring-2 ring-white"><Avatar name={m.name} size={28} /></span>
              ))}
            </span>
            <span className="font-bold text-ink-700">{p.members.length > 1 ? `${p.members[0].name} وفريقه` : p.members[0].name}</span>
            <span className="ms-auto whitespace-nowrap text-xs text-ink-400">{p.level}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

/* ============ الصفحة الرئيسية ============ */

export function HomePage() {
  usePageTitle("الرئيسية");
  const hero = useScramble("من «مرحبًا يا عالم!» إلى مشاريع حقيقية");
  const publishedArticles = ARTICLES.filter((a) => a.status === "published");
  const publishedProjects = PROJECTS.filter((p) => p.status === "published");

  return (
    <>
      {/* ===== القسم البطولي ===== */}
      <section className="dark-zone relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-dots-dark opacity-50" />
        <div className="absolute -top-32 start-1/4 size-96 rounded-full bg-primary-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 end-0 size-96 rounded-full bg-accent-500/15 blur-[120px]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.13]" aria-hidden>
          <line x1="8%" y1="0" x2="8%" y2="100%" stroke="#38CDEB" className="circuit-line" />
          <line x1="92%" y1="0" x2="92%" y2="100%" stroke="#7E91E5" className="circuit-line" />
          <line x1="0" y1="22%" x2="100%" y2="22%" stroke="#7E91E5" className="circuit-line" />
        </svg>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-800/60 px-3.5 py-1.5 font-code text-[12px] font-semibold text-accent-300">
                <IcTerminal size={14} /> منصة_أستاذ_المعلوماتية // الإصدار 2.0
              </p>
            </Reveal>
            <h1 className="font-display mt-6 min-h-[4em] text-[34px] font-black leading-[1.35] text-white sm:min-h-[2.6em] sm:text-5xl sm:leading-[1.3] lg:text-[52px]">
              {hero || " "}
            </h1>
            <Reveal delay={200}>
              <p className="mt-5 max-w-xl text-[17px] leading-8 text-ink-300">
                فضاء عربي آمن ينجز فيه التلاميذ <strong className="text-white">الامتحانات الإلكترونية بتصحيح فوري</strong>،
                ويكتبون المقالات ويبنون المشاريع — لتظهر أعمالهم هنا، في الواجهة العامة، بأبهى صورة.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link to="/login" className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-primary-600 px-7 text-[16px] font-bold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-500 hover:shadow-primary-500/40 active:scale-[.98]">
                  <IcCap size={20} /> تسجيل دخول التلميذ
                </Link>
                <Link to="/projects" className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-ink-600 bg-ink-800/40 px-6 text-[16px] font-bold text-white transition-all hover:border-accent-400/60 hover:bg-ink-800 active:scale-[.98]">
                  تصفّح أعمال التلاميذ
                </Link>
              </div>
              <p className="mt-4 flex items-center gap-2 font-code text-[12px] text-ink-400">
                <IcLock size={13} /> الدخول بحساب يسلّمه الأستاذ — لا يوجد تسجيل ذاتي
              </p>
            </Reveal>
            <Reveal delay={440}>
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[13.5px] font-semibold text-ink-300">
                <span className="flex items-center gap-2"><IcShield size={16} className="text-accent-400" /> آمنة للقاصرين</span>
                <span className="flex items-center gap-2"><IcCheckCircle size={16} className="text-emerald-400" /> تصحيح فوري</span>
                <span className="flex items-center gap-2"><IcStar size={16} className="text-gold-400" /> مراجعة قبل النشر</span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={250} className="relative">
            <div className="anim-float absolute -top-5 end-2 z-10 hidden items-center gap-2 rounded-xl border border-ink-700 bg-ink-800/90 px-4 py-2.5 shadow-xl backdrop-blur sm:flex">
              <IcCheckCircle size={18} className="text-emerald-400" />
              <span className="text-[13px] font-bold text-white">نتيجة أمينة: <span className="font-code text-emerald-300" dir="ltr">16/20</span></span>
            </div>
            <div className="anim-float absolute -bottom-5 start-2 z-10 hidden items-center gap-2 rounded-xl border border-ink-700 bg-ink-800/90 px-4 py-2.5 shadow-xl backdrop-blur sm:flex" style={{ animationDelay: "1.2s" }}>
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-code text-[11px] font-bold text-emerald-300">مقبول</span>
              <span className="text-[13px] font-bold text-white">روبوت الفرز الذكي — منشور</span>
            </div>
            <Terminal />
          </Reveal>
        </div>

        {/* شريط المواضيع المتحرك */}
        <div className="marquee relative overflow-hidden border-t border-ink-800 bg-ink-950/60 py-3.5" dir="ltr">
          <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap" dir="rtl">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center gap-8" aria-hidden={dup === 1}>
                {MARQUEE_TOPICS.map((t) => (
                  <span key={t + dup} className="flex items-center gap-8 font-display text-sm font-bold text-ink-400">
                    <span className="transition-colors hover:text-accent-300">{t}</span>
                    <span className="font-code text-accent-500/60">{"{ }"}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== أرقام عامة ===== */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200/60 lg:grid-cols-4">
            {[
              { v: 24, s: "", l: "مقالة منشورة", icon: <IcDoc size={20} /> },
              { v: 18, s: "", l: "مشروعًا معتمدًا", icon: <IcProject size={20} /> },
              { v: 132, s: "", l: "تلميذًا نشطًا", icon: <IcUsers size={20} /> },
              { v: 46, s: "", l: "امتحانًا إلكترونيًا", icon: <IcExamMini /> },
            ].map((x, i) => (
              <div key={i} className="group bg-white px-6 py-8 text-center transition-colors hover:bg-primary-50/50">
                <div className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-primary-100 text-primary-700 transition-transform duration-300 group-hover:scale-110">{x.icon}</div>
                <p className="font-display text-4xl font-black text-ink-900"><Counter to={x.v} suffix={x.s} /></p>
                <p className="mt-1.5 text-sm font-semibold text-ink-500">{x.l}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ===== أحدث المشاريع ===== */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <Reveal>
          <SectionHead
            kicker="// إنجازات_التلاميذ"
            title="مشاريع خرجت من قاعة الدرس"
            desc="مشاريع حقيقية أنجزها التلاميذ فرادى وجماعات، راجعها الأستاذ واعتمدها للعرض العام."
            action={<Link to="/projects" className="inline-flex h-11 items-center gap-2 rounded-lg border border-ink-200 bg-white px-5 text-sm font-bold text-ink-600 transition-all hover:border-primary-400 hover:text-primary-700">كل المشاريع <IcSend size={16} className="rotate-180" /></Link>}
          />
        </Reveal>
        <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 sm:-mx-6 sm:px-6">
          {publishedProjects.map((p, i) => (
            <Reveal key={p.id} delay={i * 110} className="shrink-0 snap-start">
              <ProjectCard p={p} fixedWidth />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== أحدث المقالات ===== */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <Reveal>
          <SectionHead
            kicker="// أقلام_صاعدة"
            title="قدراتٌ كتبها التلاميذ بأنفسهم"
            desc="مقالات معتمدة من الأستاذ، بأسلوب التلاميذ أنفسهم — مبسطة، صحيحة، وممتعة."
            action={<Link to="/articles" className="inline-flex h-11 items-center gap-2 rounded-lg border border-ink-200 bg-white px-5 text-sm font-bold text-ink-600 transition-all hover:border-primary-400 hover:text-primary-700">كل المقالات <IcSend size={16} className="rotate-180" /></Link>}
          />
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2"><ArticleCard a={publishedArticles[0]} big /></Reveal>
          <div className="grid gap-6">
            {publishedArticles.slice(1, 3).map((a, i) => (
              <Reveal key={a.id} delay={120 + i * 120}><ArticleCard a={a} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== كيف تعمل ===== */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <Reveal>
          <SectionHead
            kicker="// كيف_تعمل_المنصة"
            title="ثلاث خطوات… ولا شيء غيرهن"
            desc="صُممت التجربة لتكون بسيطة للتلميذ ومحكمة للأستاذ في الوقت نفسه."
          />
        </Reveal>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-0">
            {[
              { n: "01", t: "يستلم التلميذ قصاصة الدخول من الأستاذ", d: "اسم مستخدم وكلمة مرور أولية على قصاصة مطبوعة. لا بريد إلكتروني ولا تسجيل ذاتي — حماية كاملة للقاصرين.", icon: <IcLock size={22} /> },
              { n: "02", t: "يتعلّم وينجز: امتحانات ومقالات ومشاريع", d: "يمتحن إلكترونيًا بتصحيح فوري، يكتب المقالات، ويبني المشاريع فردًا أو ضمن فريق — مع حفظ تلقائي لكل خطوة.", icon: <IcCode size={22} /> },
              { n: "03", t: "يراجع الأستاذ… ثم يُنشر العمل للعالم", d: "لا يصل أي محتوى للواجهة العامة قبل موافقة الأستاذ. عند القبول، يظهر العمل باسم التلميذ في صفحات المنصة.", icon: <IcCheckCircle size={22} /> },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 140}>
                <div className="relative flex gap-5 pb-10 last:pb-0">
                  {i < 2 && <span className="absolute start-[27px] top-16 bottom-2 w-px border-s-2 border-dashed border-ink-200" />}
                  <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl border-2 border-primary-200 bg-primary-50 text-primary-700">{s.icon}</span>
                  <div>
                    <p className="font-code text-xs font-bold text-accent-600" dir="ltr">{s.n}</p>
                    <h3 className="font-display mt-1 text-lg font-bold text-ink-900">{s.t}</h3>
                    <p className="mt-1.5 text-[15px] leading-7 text-ink-500">{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="dark-zone relative overflow-hidden rounded-3xl bg-ink-900 p-8 lg:p-10">
              <div className="absolute inset-0 bg-dots-dark opacity-50" />
              <div className="relative">
                <IcBook size={34} className="text-accent-400" />
                <blockquote className="font-display mt-5 text-2xl font-bold leading-relaxed text-white lg:text-[28px]">
                  «أجمل لحظة في السنة؟ حين يرى التلميذ اسمه منشورًا تحت أول مشروع أنجزه بيده.»
                </blockquote>
                <p className="mt-5 text-sm font-semibold text-ink-400">الأستاذ كريم الإدريسي — أستاذ مادة المعلوماتية</p>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {[
                    { v: "86%", l: "نسبة إكمال الامتحانات" },
                    { v: "78%", l: "نسبة النجاح" },
                    { v: "4.8/5", l: "رضا التلاميذ" },
                  ].map((x) => (
                    <div key={x.l} className="rounded-xl border border-ink-700 bg-ink-800/50 px-3 py-4 text-center">
                      <p className="font-code text-xl font-bold text-accent-300" dir="ltr">{x.v}</p>
                      <p className="mt-1 text-[11px] font-semibold text-ink-400">{x.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== نداء الأستاذ ===== */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <Reveal>
          <div className="dark-zone relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-ink-900 px-8 py-10 sm:flex-row sm:items-center lg:px-12">
            <div className="absolute inset-0 bg-dots-dark opacity-40" />
            <div className="absolute -end-20 -top-20 size-64 rounded-full bg-primary-600/25 blur-[90px]" />
            <div className="relative">
              <p className="font-code text-[13px] font-semibold text-accent-300" dir="ltr">$ sudo teacher --dashboard</p>
              <h2 className="font-display mt-2 text-2xl font-extrabold text-white sm:text-3xl">أنت الأستاذ؟ مركز قيادتك جاهز.</h2>
              <p className="mt-2 max-w-xl leading-7 text-ink-300">تلاميذ، امتحانات، بنك أسئلة، إحصائيات تفصيلية، ومراجعة محتوى — كل شيء من لوحة واحدة.</p>
            </div>
            <Link to="/teacher/login" className="relative inline-flex h-12 shrink-0 items-center gap-2.5 rounded-xl bg-gold-400 px-7 text-[16px] font-bold text-ink-900 shadow-lg shadow-gold-500/25 transition-all hover:bg-gold-300 active:scale-[.98]">
              <IcShield size={20} /> دخول لوحة الأستاذ
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function IcExamMini() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 2.8h6v3H9zM9 12l1.8 1.8L14.5 10M9 17h6" />
    </svg>
  );
}

/* ============ صفحات القوائم ============ */

export function ArticlesPage() {
  usePageTitle("المقالات");
  const loaded = useLoaded();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("الكل");
  const published = ARTICLES.filter((a) => a.status === "published");
  const tags = ["الكل", ...Array.from(new Set(published.flatMap((a) => a.tags)))];
  const filtered = published.filter(
    (a) =>
      (tag === "الكل" || a.tags.includes(tag)) &&
      (q.trim() === "" || a.title.includes(q) || a.summary.includes(q) || a.author.name.includes(q)),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Reveal>
        <SectionHead
          kicker="// مكتبة_التلاميذ"
          title="مقالات معتمدة من الأستاذ"
          desc="كل ما تراه هنا كتبه تلاميذ، وراجعه الأستاذ واعتمده. المحتوى غير المنشور لا يظهر للزوار أبدًا."
        />
      </Reveal>
      <Reveal delay={120}>
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <SearchBox value={q} onChange={setQ} placeholder="ابحث في المقالات…" className="w-full sm:w-72" />
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={cx(
                  "rounded-lg px-4 py-2 text-sm font-bold transition-all",
                  tag === t ? "bg-ink-900 text-white shadow-sm" : "border border-ink-200 bg-white text-ink-500 hover:border-primary-300 hover:text-primary-700",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Reveal>
      {!loaded ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="space-y-3 p-5"><Skeleton className="h-5 w-4/5" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<IcDoc size={30} />} title="لا توجد نتائج مطابقة" desc="جرّب كلمة أخرى أو أزل الفلاتر — المقالات الجديدة تُنشر باستمرار." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 110}><ArticleCard a={a} /></Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectsPage() {
  usePageTitle("المشاريع");
  const loaded = useLoaded();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("الكل");
  const published = PROJECTS.filter((p) => p.status === "published");
  const filtered = published.filter(
    (p) =>
      (kind === "الكل" || p.kind === kind) &&
      (q.trim() === "" || p.title.includes(q) || p.summary.includes(q) || p.members.some((m) => m.name.includes(q))),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Reveal>
        <SectionHead
          kicker="// معرض_الأعمال"
          title="مشاريع تفتخر بها المؤسسة"
          desc="مشاريع فردية وجماعية أنجزها التلاميذ وراجعتها الأستاذة قبل اعتمادها للعرض العام."
        />
      </Reveal>
      <Reveal delay={120}>
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <SearchBox value={q} onChange={setQ} placeholder="ابحث في المشاريع…" className="w-full sm:w-72" />
          <div className="flex gap-2">
            {["الكل", "فردي", "جماعي"].map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={cx(
                  "rounded-lg px-4 py-2 text-sm font-bold transition-all",
                  kind === k ? "bg-ink-900 text-white shadow-sm" : "border border-ink-200 bg-white text-ink-500 hover:border-primary-300 hover:text-primary-700",
                )}
              >
                {k === "الكل" ? k : `مشاريع ${k === "فردي" ? "فردية" : "جماعية"}`}
              </button>
            ))}
          </div>
        </div>
      </Reveal>
      {!loaded ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="space-y-3 p-5"><Skeleton className="h-5 w-4/5" /><Skeleton className="h-4 w-full" /></div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<IcProject size={30} />} title="لا توجد مشاريع مطابقة" desc="جرّب بحثًا آخر — مشاريع جديدة تُعتمد كل أسبوع تقريبًا." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 110}><ProjectCard p={p} /></Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ صفحات التفاصيل ============ */

export function ArticleDetailPage() {
  const { id } = useParams();
  const a = ARTICLES.find((x) => x.id === id && x.status === "published");
  const toast = useToast();
  usePageTitle(a ? a.title : "مقال غير موجود");
  if (!a) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <EmptyState
          icon={<IcDoc size={30} />}
          title="هذا المقال غير متاح"
          desc="ربما لم يُنشر بعد، أو تمت إزالة نشره. المحتوى غير المعتمد لا يظهر للزوار حفاظًا على جودة المنصة."
          action={<Link to="/articles" className="inline-flex h-11 items-center rounded-lg bg-primary-600 px-5 text-sm font-bold text-white">العودة إلى المقالات</Link>}
        />
      </div>
    );
  }
  const related = ARTICLES.filter((x) => x.status === "published" && x.id !== a.id).slice(0, 2);
  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="anim-fade-up">
          <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-[13px] font-semibold text-ink-400">
            <Link to="/" className="hover:text-primary-600">الرئيسية</Link><span>/</span>
            <Link to="/articles" className="hover:text-primary-600">المقالات</Link><span>/</span>
            <span className="text-ink-600">المقال</span>
          </nav>
          <div className="flex flex-wrap gap-2">{a.tags.map((t) => <Chip key={t} tone="primary">{t}</Chip>)}</div>
          <h1 className="font-display mt-4 text-3xl font-black leading-snug text-ink-900 sm:text-4xl sm:leading-snug">{a.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-ink-100 py-4 text-sm">
            <Avatar name={a.author.name} size={38} />
            <div>
              <p className="font-bold text-ink-800">{a.author.name}</p>
              <p className="text-xs text-ink-400">{a.author.level} · {fmtDate(a.date)} · {a.readMin} دقائق للقراءة</p>
            </div>
            <StatusPill status={a.status} />
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.push({ tone: "success", title: "نُسخ الرابط", desc: "يمكنك مشاركة المقال الآن." }); }}
              className="ms-auto inline-flex h-9 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3.5 text-[13px] font-bold text-ink-600 transition-all hover:border-primary-400 hover:text-primary-700"
            >
              <IcLinkMini /> نسخ الرابط
            </button>
          </div>
          <div className="mt-7 overflow-hidden rounded-2xl border border-ink-200">
            <CoverImg src={a.cover ?? COVERS.binary} alt={a.title} icon="doc" className="h-64 w-full sm:h-80" />
          </div>
          <div className="prose-ar mt-8 max-w-3xl space-y-5 text-[17px] leading-8 text-ink-700">
            {a.body?.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {a.code && (
            <div className="dark-zone mt-8 max-w-3xl overflow-hidden rounded-xl border border-ink-700 bg-ink-950">
              <div className="flex items-center justify-between border-b border-ink-800 px-4 py-2.5">
                <span className="font-code text-[11px] text-ink-400" dir="ltr">{a.code.lang}</span>
                <div className="flex gap-1.5"><span className="size-2 rounded-full bg-ink-700" /><span className="size-2 rounded-full bg-ink-700" /><span className="size-2 rounded-full bg-accent-500/60" /></div>
              </div>
              <pre className="overflow-x-auto p-5 font-code text-[13.5px] leading-7 text-accent-300" dir="ltr">{a.code.text}</pre>
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6 text-center">
            <Avatar name={a.author.name} size={64} className="mx-auto" />
            <p className="font-display mt-3 text-lg font-bold text-ink-900">{a.author.name}</p>
            <p className="mt-1 text-sm text-ink-500">{a.author.level}</p>
            <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs leading-6 text-ink-400">
              اسم عرض آمن يحمي هوية التلميذ وفقًا لسياسة الخصوصية.
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="font-display text-sm font-bold text-ink-800">مقالات ذات صلة</h3>
            <div className="mt-3 space-y-3">
              {related.map((r) => (
                <Link key={r.id} to={`/articles/${r.id}`} className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-ink-50">
                  <CoverImg src={r.cover} alt="" icon="doc" className="h-14 w-20 shrink-0 rounded-lg" />
                  <span className="text-sm font-bold leading-6 text-ink-700 transition-colors group-hover:text-primary-700 clamp-2">{r.title}</span>
                </Link>
              ))}
            </div>
          </Card>
          <div className="dark-zone relative overflow-hidden rounded-xl bg-ink-900 p-6">
            <div className="absolute inset-0 bg-dots-dark opacity-50" />
            <div className="relative">
              <IcCap size={26} className="text-accent-400" />
              <p className="font-display mt-3 font-bold leading-7 text-white">هل أنت تلميذ في المنصة؟ انشر عملك هنا أيضًا.</p>
              <Link to="/login" className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent-400 px-5 text-sm font-bold text-ink-950 transition-colors hover:bg-accent-300">تسجيل الدخول</Link>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

function IcLinkMini() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 14.5a4 4 0 0 0 6 .5l2.5-2.5a4 4 0 0 0-5.7-5.7L11.5 8" />
      <path d="M14 9.5a4 4 0 0 0-6-.5L5.5 11.5a4 4 0 0 0 5.7 5.7l1.3-1.2" />
    </svg>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const p = PROJECTS.find((x) => x.id === id && x.status === "published");
  usePageTitle(p ? p.title : "مشروع غير موجود");
  if (!p) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <EmptyState
          icon={<IcProject size={30} />}
          title="هذا المشروع غير متاح"
          desc="ربما لم يُعتمد بعد من الأستاذ. المحتوى قيد المراجعة لا يظهر للزوار."
          action={<Link to="/projects" className="inline-flex h-11 items-center rounded-lg bg-primary-600 px-5 text-sm font-bold text-white">العودة إلى المشاريع</Link>}
        />
      </div>
    );
  }
  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="anim-fade-up">
          <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-[13px] font-semibold text-ink-400">
            <Link to="/" className="hover:text-primary-600">الرئيسية</Link><span>/</span>
            <Link to="/projects" className="hover:text-primary-600">المشاريع</Link><span>/</span>
            <span className="text-ink-600">المشروع</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={p.kind === "جماعي" ? "accent" : "gold"}>{p.kind === "جماعي" ? <IcUsers size={13} /> : <IcUser size={13} />} مشروع {p.kind}</Chip>
            <Chip tone="neutral">{p.level}</Chip>
            <StatusPill status={p.status} />
          </div>
          <h1 className="font-display mt-4 text-3xl font-black leading-snug text-ink-900 sm:text-4xl sm:leading-snug">{p.title}</h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-8 text-ink-600">{p.summary}</p>
          <div className="mt-7 overflow-hidden rounded-2xl border border-ink-200">
            <CoverImg src={p.cover} alt={p.title} className="h-64 w-full sm:h-80" />
          </div>
          <div className="mt-8 max-w-3xl space-y-5 text-[17px] leading-8 text-ink-700">
            {p.body?.map((b, i) => <p key={i}>{b}</p>)}
          </div>
          {p.link && (
            <div className={cx("mt-8 max-w-3xl rounded-xl border p-4", p.link.verified ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60")}>
              <div className="flex flex-wrap items-center gap-3">
                <span className={cx("grid size-10 place-items-center rounded-lg", p.link.verified ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                  {p.link.verified ? <IcCheckCircle size={20} /> : <IcAlert size={20} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-bold text-ink-800">
                    {p.link.label}
                    <span className={cx("rounded px-2 py-0.5 text-[11px] font-bold", p.link.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800")}>
                      {p.link.verified ? "مُتحقَّق منه" : "لم يتم التحقق بعد"}
                    </span>
                  </p>
                  <p className="truncate font-code text-xs text-ink-500" dir="ltr">{p.link.url}</p>
                </div>
                <a href={p.link.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-bold text-ink-600 transition-all hover:border-primary-400 hover:text-primary-700">
                  فتح <IcExternal size={15} />
                </a>
              </div>
              {!p.link.verified && <p className="mt-2.5 text-xs leading-6 text-amber-700">الرابط خارجي ولم تتحقق منه المنصة بعد — يُفتح على مسؤوليتك.</p>}
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <h3 className="font-display text-sm font-bold text-ink-800">فريق العمل</h3>
            <ul className="mt-4 space-y-3.5">
              {p.members.map((m) => (
                <li key={m.name} className="flex items-center gap-3">
                  <Avatar name={m.name} size={38} />
                  <div>
                    <p className="text-sm font-bold text-ink-800">{m.name}</p>
                    <p className="text-xs text-ink-400">{m.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-sm font-bold text-ink-800">التقنيات المستخدمة</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <span key={t} className="rounded-lg bg-ink-900 px-3 py-1.5 font-code text-xs font-medium text-accent-300" dir="ltr">{t}</span>
              ))}
            </div>
            <p className="mt-4 text-xs leading-6 text-ink-400">نُشر في {fmtDate(p.date)} · {timeAgo(p.date)}</p>
          </Card>
        </aside>
      </div>
    </article>
  );
}
