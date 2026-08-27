import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEMO_USERS } from "./data";

/* ================= utils ================= */

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function usePageTitle(t: string) {
  useEffect(() => {
    document.title = `${t} — منصة أستاذ المعلوماتية`;
  }, [t]);
}

const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "ماي",
  "يونيو",
  "يوليوز",
  "غشت",
  "شتنبر",
  "أكتوبر",
  "نونبر",
  "دجنبر",
];

export function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${fmtDate(iso)} · ${h}:${m}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "قبل لحظات";
  if (min < 60) return `قبل ${min} دقيقة`;
  const h = Math.floor(min / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d === 1) return "قبل يوم";
  if (d < 30) return `قبل ${d} أيام`;
  return fmtDate(iso);
}

export function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

export function downloadBlob(filename: string, blob: Blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 800);
}

export function downloadCSV(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>,
) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv =
    "\uFEFF" +
    [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

export function downloadText(filename: string, text: string, mime = "text/plain") {
  downloadBlob(filename, new Blob(["\uFEFF" + text], { type: mime + ";charset=utf-8" }));
}

/* ================= motion helpers ================= */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cx("reveal", inView && "in", className)}
    >
      {children}
    </div>
  );
}

const SCRAMBLE_POOL =
  "ابتثجحخدذرزسشصضطظعغفقكلمنهوي</>{}[]=+*#01";

export function useScramble(text: string, startDelay = 150) {
  const [out, setOut] = useState(() => (prefersReduced() ? text : ""));

  useEffect(() => {
    if (prefersReduced()) {
      setOut(text);
      return;
    }
    let frame = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        frame++;
        const fixed = Math.floor(frame / 2.2);
        let s = "";
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          if (c === " " || c === "،" || c === ".") {
            s += c;
            continue;
          }
          s +=
            i < fixed
              ? c
              : SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)];
        }
        setOut(s);
        if (fixed >= text.length && interval) clearInterval(interval);
      }, 38);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, startDelay]);

  return out;
}

export function Counter({
  to,
  suffix = "",
  className,
  duration = 1300,
}: {
  to: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(prefersReduced() ? to : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      setVal(to);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(to * eased));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {val}
      {suffix}
    </span>
  );
}

/* ================= pseudo QR ================= */

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function PseudoQR({
  seed,
  size = 64,
  className,
}: {
  seed: string;
  size?: number;
  className?: string;
}) {
  const n = 21;
  const rnd = mulberry(hashStr(seed));
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) cells.push(rnd() < 0.44);
  const inFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const finderOn = (r: number, c: number) => {
    const lr = r < 7 ? r : r - (n - 7);
    const lc = c < 7 ? c : c - (n - 7);
    return (
      lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4)
    );
  };
  const rects = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const on = inFinder(r, c) ? finderOn(r, c) : cells[r * n + c];
      if (on) rects.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" />);
    }
  }
  return (
    <svg
      viewBox={`-1 -1 ${n + 2} ${n + 2}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="رمز الدخول السريع"
    >
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" />
      <g fill="#0A1633">{rects}</g>
    </svg>
  );
}

/* ================= connectivity ================= */

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

/* ================= auth / session ================= */

export interface SessionUser {
  name: string;
  username: string;
  role: "student" | "teacher";
  level?: string;
  group?: string;
}

interface StoredSession {
  user: SessionUser;
  expiresAt: number;
}

interface AuthCtxType {
  user: SessionUser | null;
  expired: boolean;
  login: (
    username: string,
    password: string,
    role: "student" | "teacher",
  ) => { ok: boolean; error?: string };
  logout: () => void;
  acknowledgeExpired: () => void;
}

const AuthCtx = createContext<AuthCtxType>(null!);
const SESSION_KEY = "aie.session.v1";
const SESSION_MS = 45 * 60 * 1000;

function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readSession()?.user ?? null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const check = () => {
      const s = readSession();
      if (s && Date.now() > s.expiresAt) {
        setExpired(true);
      }
    };
    check();
    const id = setInterval(check, 20000);
    return () => clearInterval(id);
  }, []);

  const login: AuthCtxType["login"] = (username, password, role) => {
    const found = DEMO_USERS.find(
      (u) => u.username === username.trim() && u.role === role,
    );
    if (!found || found.password !== password) {
      return {
        ok: false,
        error: "اسم المستخدم أو كلمة المرور غير صحيحة. تحقّق من بياناتك وأعد المحاولة.",
      };
    }
    const session: StoredSession = {
      user: {
        name: found.name,
        username: found.username,
        role: found.role,
        level: found.level,
        group: found.group,
      },
      expiresAt: Date.now() + SESSION_MS,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session.user);
    setExpired(false);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setExpired(false);
  };

  const acknowledgeExpired = () => {
    logout();
  };

  return (
    <AuthCtx.Provider value={{ user, expired, login, logout, acknowledgeExpired }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
