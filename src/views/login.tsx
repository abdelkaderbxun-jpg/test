import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, usePageTitle } from "../core";
import { Alert, Btn, Field, Modal, TextInput, useToast } from "../ui";
import {
  IcCap, IcCheckCircle, IcEye, IcEyeOff, IcMail, IcShield, IcTerminal, LogoMark,
} from "../icons";

function AuthShell({
  title,
  subtitle,
  children,
  side,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  side: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <Link to="/" className="flex w-fit items-center gap-2.5">
          <LogoMark size={36} />
          <span className="leading-none">
            <span className="block font-display text-base font-extrabold text-ink-900">أستاذ المعلوماتية</span>
            <span className="mt-1 block font-code text-[10px] text-ink-400">EDU·PLATFORM v2</span>
          </span>
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="anim-fade-up rounded-2xl border border-ink-200/80 bg-white p-7 shadow-[0_18px_50px_-24px_rgba(26,46,92,0.25)] sm:p-8">
            <h1 className="font-display text-2xl font-extrabold text-ink-900">{title}</h1>
            <p className="mt-2 text-[15px] leading-7 text-ink-500">{subtitle}</p>
            {children}
          </div>
          <p className="mt-6 text-center text-sm text-ink-400">
            <Link to="/" className="font-bold text-primary-600 hover:text-primary-700">العودة إلى الصفحة الرئيسية</Link>
          </p>
        </div>
      </div>
      <div className="dark-zone relative hidden overflow-hidden bg-ink-900 lg:block">{side}</div>
    </div>
  );
}

function LoginForm({
  role,
  onSuccess,
  maxFails = 0,
}: {
  role: "student" | "teacher";
  onSuccess: () => void;
  maxFails?: number;
}) {
  const { login } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fails, setFails] = useState(0);
  const [lockLeft, setLockLeft] = useState(0);

  const locked = maxFails > 0 && fails >= maxFails;

  useEffect(() => {
    if (lockLeft <= 0) return;
    const id = setInterval(() => setLockLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [lockLeft]);

  useEffect(() => {
    if (lockLeft === 0 && fails >= maxFails && maxFails > 0) setFails(0);
  }, [lockLeft, fails, maxFails]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || locked) return;
    if (!username.trim() || !password) {
      setError("أدخل اسم المستخدم وكلمة المرور.");
      return;
    }
    setBusy(true);
    setError("");
    setTimeout(() => {
      const res = login(username, password, role);
      setBusy(false);
      if (res.ok) {
        toast.push({
          tone: "success",
          title: role === "student" ? "مرحبًا بعودتك!" : "تم تسجيل الدخول",
          desc: role === "student" ? "وجّهناك إلى فضائك الشخصي." : "أهلًا بك في مركز القيادة.",
        });
        onSuccess();
      } else {
        const f = fails + 1;
        setFails(f);
        setError(res.error ?? "تعذّر تسجيل الدخول.");
        if (maxFails > 0 && f >= maxFails) {
          setLockLeft(30);
          toast.push({ tone: "warning", title: "إيقاف مؤقت", desc: "محاولات كثيرة خاطئة — أُوقف النموذج 30 ثانية لحماية الحساب." });
        }
      }
    }, 750);
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
      {error && (
        <Alert tone="danger" title="تعذّر تسجيل الدخول">{error}</Alert>
      )}
      {locked && lockLeft > 0 && (
        <Alert tone="warning" title="أُوقف النموذج مؤقتًا">
          أعد المحاولة بعد <strong className="font-code" dir="ltr">{lockLeft}s</strong> — حماية من المحاولات المتكررة.
        </Alert>
      )}
      <Field label="اسم المستخدم" required>
        <TextInput
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={role === "student" ? "مثال: amina" : "اسم المستخدم الخاص بالأستاذ"}
          autoComplete="username"
          dir="ltr"
          className="text-start font-code"
          disabled={locked}
        />
      </Field>
      <Field label="كلمة المرور" required>
        <div className="relative">
          <TextInput
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            dir="ltr"
            className="pe-11 text-start font-code"
            disabled={locked}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            className="absolute end-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
          >
            {show ? <IcEyeOff size={18} /> : <IcEye size={18} />}
          </button>
        </div>
      </Field>
      <Btn type="submit" full loading={busy} disabled={locked} className="h-12 text-base">
        {role === "student" ? "دخول فضاء التلميذ" : "دخول لوحة التحكم"}
      </Btn>
      {role === "teacher" && (
        <ForgotLink />
      )}
    </form>
  );
}

function ForgotLink() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="block w-full text-center text-sm font-bold text-primary-600 hover:text-primary-700">
        نسيت كلمة المرور؟
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="استعادة كلمة المرور"
        footer={<Btn v="outline" sm onClick={() => setOpen(false)}>فهمت</Btn>}
      >
        <p className="text-sm leading-7 text-ink-600">
          الاسترجاع التلقائي عبر البريد الإلكتروني <strong>غير مفعّل</strong> في هذا العرض.
          لإعادة تعيين كلمة المرور، تواصل مع إدارة المؤسسة عبر:
        </p>
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2.5 font-code text-sm text-primary-700" dir="ltr">
          <IcMail size={16} /> admin@school.ma
        </p>
      </Modal>
    </>
  );
}

export function StudentLogin() {
  usePageTitle("تسجيل دخول التلميذ");
  const navigate = useNavigate();
  const [fillOpen, setFillOpen] = useState(false);

  return (
    <AuthShell
      title="أهلًا بعودتك! 🎒"
      subtitle="ادخل بحسابك الذي سلّمك إياه الأستاذ لمتابعة امتحاناتك وأعمالك."
      side={
        <div className="relative flex h-full flex-col justify-center p-14">
          <div className="absolute inset-0 bg-dots-dark opacity-50" />
          <div className="absolute -start-24 top-16 size-72 rounded-full bg-primary-600/25 blur-[100px]" />
          <div className="relative">
            <IcCap size={40} className="text-accent-400" />
            <blockquote className="font-display mt-6 max-w-md text-3xl font-bold leading-relaxed text-white">
              «كل تلميذ يحمل في داخله مبرمجًا صغيرًا… ينتظر أول سطر كود.»
            </blockquote>
            <p className="mt-5 text-sm font-semibold text-ink-400">شعار النادي العلمي — الموسم الدراسي 2026</p>
            <div className="mt-10 flex flex-col gap-3">
              <div className="flex w-fit items-center gap-2.5 rounded-xl border border-ink-700 bg-ink-800/60 px-4 py-3 text-sm font-bold text-white">
                <IcCheckCircle size={18} className="text-emerald-400" /> تصحيح فوري ونتائج مشجعة
              </div>
              <div className="flex w-fit items-center gap-2.5 rounded-xl border border-ink-700 bg-ink-800/60 px-4 py-3 text-sm font-bold text-white ms-8">
                <IcTerminal size={18} className="text-accent-400" /> حفظ تلقائي — لا تضيع إجاباتك أبدًا
              </div>
              <div className="flex w-fit items-center gap-2.5 rounded-xl border border-ink-700 bg-ink-800/60 px-4 py-3 text-sm font-bold text-white">
                <IcCheckCircle size={18} className="text-gold-400" /> أعمالك تُنشر باسمك بعد مراجعة الأستاذ
              </div>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm role="student" onSuccess={() => navigate("/student")} />
      <div className="mt-5 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/50 p-4">
        <p className="text-xs font-bold text-primary-700">حساب تجريبي للعرض</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="font-code text-[13px] text-ink-600" dir="ltr">amina / 1234</p>
          <button onClick={() => setFillOpen(true)} className="text-xs font-bold text-primary-600 underline underline-offset-4 hover:text-primary-700">
            كيف أملأ الحقول؟
          </button>
        </div>
      </div>
      <Modal open={fillOpen} onClose={() => setFillOpen(false)} title="حساب تجريبي" footer={<Btn sm onClick={() => setFillOpen(false)}>فهمت</Btn>}>
        <p className="text-sm leading-7 text-ink-600">
          هذا عرض تجريبي للمنصة. اكتب في الحقلين اسم المستخدم <code className="rounded bg-ink-100 px-1.5 font-code text-primary-700" dir="ltr">amina</code> وكلمة المرور <code className="rounded bg-ink-100 px-1.5 font-code text-primary-700" dir="ltr">1234</code> ثم اضغط زر الدخول.
        </p>
      </Modal>
    </AuthShell>
  );
}

export function TeacherLogin() {
  usePageTitle("دخول الأستاذ");
  const navigate = useNavigate();
  const [fillOpen, setFillOpen] = useState(false);

  return (
    <AuthShell
      title="منطقة الأستاذ المحمية"
      subtitle="وصول مقيّد لأعضاء هيئة التدريس فقط. الجلسات محدودة الزمن وكل النشاط يُسجَّل."
      side={
        <div className="relative flex h-full flex-col justify-center p-14">
          <div className="absolute inset-0 bg-dots-dark opacity-40" />
          <div className="absolute -end-24 bottom-16 size-72 rounded-full bg-accent-500/15 blur-[100px]" />
          <div className="relative">
            <span className="grid size-16 place-items-center rounded-2xl border border-ink-700 bg-ink-800/70 text-gold-400">
              <IcShield size={32} />
            </span>
            <h2 className="font-display mt-7 text-3xl font-extrabold leading-snug text-white">أمان بمستوى<br />غرفة الأساتذة</h2>
            <ul className="mt-8 space-y-4 text-[15px] text-ink-300">
              {[
                "رسائل خطأ عامة لا تكشف أي معلومات عن الحسابات",
                "قفل مؤقت بعد المحاولات المتكررة الخاطئة",
                "جلسات تنتهي تلقائيًا بعد 45 دقيقة",
                "سجل نشاط كامل داخل لوحة التحكم",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <IcCheckCircle size={19} className="mt-0.5 shrink-0 text-accent-400" /> {f}
                </li>
              ))}
            </ul>
            <p className="mt-10 font-code text-xs text-ink-500" dir="ltr">TLS 1.3 · session_ttl=45m · audit=on</p>
          </div>
        </div>
      }
    >
      <LoginForm role="teacher" maxFails={5} onSuccess={() => navigate("/teacher")} />
      <div className="mt-5 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/60 p-4">
        <p className="text-xs font-bold text-ink-500">حساب تجريبي للعرض</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="font-code text-[13px] text-ink-600" dir="ltr">prof / 2026</p>
          <button onClick={() => setFillOpen(true)} className="text-xs font-bold text-primary-600 underline underline-offset-4 hover:text-primary-700">
            كيف أملأ الحقول؟
          </button>
        </div>
      </div>
      <Modal open={fillOpen} onClose={() => setFillOpen(false)} title="حساب تجريبي" footer={<Btn sm onClick={() => setFillOpen(false)}>فهمت</Btn>}>
        <p className="text-sm leading-7 text-ink-600">
          اكتب في الحقلين اسم المستخدم <code className="rounded bg-ink-100 px-1.5 font-code text-primary-700" dir="ltr">prof</code> وكلمة المرور <code className="rounded bg-ink-100 px-1.5 font-code text-primary-700" dir="ltr">2026</code> ثم اضغط زر الدخول.
        </p>
      </Modal>
    </AuthShell>
  );
}
