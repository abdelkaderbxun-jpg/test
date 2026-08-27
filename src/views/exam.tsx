import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { cx, fmtDateTime, prefersReduced, useOnline, usePageTitle } from "../core";
import { EXAMS, type StoredResult } from "../data";
import { Alert, Bar, Btn, Card, Chip, ExamPill, Modal, Ring, useToast } from "../ui";
import {
  IcCheck, IcCheckCircle, IcChevronEnd, IcChevronStart, IcCircle, IcClock, IcFlag, IcInfo,
  IcLock, IcSend, IcSquare, IcTrophy, IcWifiOff, IcXCircle,
} from "../icons";

const ANS_KEY = (id: string) => `aie.answers.${id}`;
const RES_KEY = (id: string) => `aie.result.${id}`;
const START_KEY = (id: string) => `aie.started.${id}`;

function loadJSON<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

const fmtClock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ================== شاشة حل الامتحان ================== */

export function ExamPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const online = useOnline();
  const exam = EXAMS.find((e) => e.id === id && e.status === "available");
  usePageTitle(exam ? exam.title : "امتحان");

  const [phase, setPhase] = useState<"intro" | "run">("intro");
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [idx, setIdx] = useState(0);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "offline">("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [timeUpOpen, setTimeUpOpen] = useState(false);
  const [finalCheck, setFinalCheck] = useState(false);
  const submittedRef = useRef(false);

  /* إذا وُجدت نتيجة سابقة → إلى صفحة النتيجة */
  useEffect(() => {
    if (id && loadJSON<StoredResult>(RES_KEY(id))) navigate(`/student/exams/${id}/result`, { replace: true });
  }, [id, navigate]);

  const finalize = (ans: Record<string, number[]>, auto: boolean) => {
    if (!exam) return;
    let score = 0;
    for (const q of exam.questions) {
      const picked = [...(ans[q.id] ?? [])].sort((a, b) => a - b).join(",");
      const correct = [...q.correct].sort((a, b) => a - b).join(",");
      if (picked !== "" && picked === correct) score += q.points;
    }
    const total = exam.questions.reduce((s, q) => s + q.points, 0);
    const res: StoredResult = { score, total, answers: ans, finishedAt: new Date().toISOString(), autoSubmitted: auto };
    localStorage.setItem(RES_KEY(exam.id), JSON.stringify(res));
    localStorage.removeItem(ANS_KEY(exam.id));
    localStorage.removeItem(START_KEY(exam.id));
  };

  const start = () => {
    if (!exam) return;
    const started = loadJSON<number>(START_KEY(exam.id));
    const startTs = started ?? Date.now();
    const dl = startTs + exam.durationMin * 60000;
    if (Date.now() >= dl) {
      /* انتهى الوقت قبل العودة */
      submittedRef.current = true;
      finalize(loadJSON<Record<string, number[]>>(ANS_KEY(exam.id)) ?? {}, true);
      navigate(`/student/exams/${exam.id}/result`, { replace: true });
      return;
    }
    if (!started) localStorage.setItem(START_KEY(exam.id), JSON.stringify(Date.now()));
    setAnswers(loadJSON<Record<string, number[]>>(ANS_KEY(exam.id)) ?? {});
    setDeadline(dl);
    setRemaining(Math.round((dl - Date.now()) / 1000));
    setPhase("run");
  };

  /* العدّاد */
  useEffect(() => {
    if (phase !== "run" || deadline === null) return;
    const calc = () => {
      const r = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(r);
      return r;
    };
    if (calc() === 0) return;
    const int = setInterval(() => {
      if (calc() === 0 && !submittedRef.current) {
        clearInterval(int);
        submittedRef.current = true;
        finalize(answersRef.current, true);
        setTimeUpOpen(true);
      }
    }, 1000);
    return () => clearInterval(int);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, deadline]);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  /* الحفظ التلقائي */
  const firstSave = useRef(true);
  useEffect(() => {
    if (phase !== "run") return;
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }
    if (!online) {
      setSaveState("offline");
      return;
    }
    setSaveState("saving");
    const t = setTimeout(() => {
      localStorage.setItem(ANS_KEY(exam!.id), JSON.stringify(answers));
      setSaveState("saved");
    }, 500);
    return () => clearTimeout(t);
  }, [answers, phase, online, exam]);

  if (!exam) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <Alert tone="warning" title="الامتحان غير متاح">
          هذا الامتحان غير موجود أو خارج فترته الزمنية. عُد إلى قائمة الامتحانات.
        </Alert>
        <div className="mt-5 text-center">
          <Link to="/student/exams" className="inline-flex h-11 items-center rounded-lg bg-primary-600 px-5 text-sm font-bold text-white">قائمة الامتحانات</Link>
        </div>
      </div>
    );
  }

  const total = exam.questions.reduce((s, q) => s + q.points, 0);
  const answeredCount = exam.questions.filter((q) => (answers[q.id] ?? []).length > 0).length;
  const q = exam.questions[idx];
  const picked = answers[q.id] ?? [];
  const unanswered = exam.questions
    .map((qq, i) => ((answers[qq.id] ?? []).length === 0 ? i + 1 : null))
    .filter((x): x is number => x !== null);

  const toggle = (oi: number) => {
    setAnswers((prev) => {
      if (q.kind === "single") return { ...prev, [q.id]: [oi] };
      const cur = prev[q.id] ?? [];
      const next = cur.includes(oi) ? cur.filter((x) => x !== oi) : [...cur, oi];
      return { ...prev, [q.id]: next };
    });
  };

  /* ====== شاشة المقدمة ====== */
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <Card className="anim-fade-up overflow-hidden">
          <div className="dark-zone relative bg-ink-900 p-7">
            <div className="absolute inset-0 bg-dots-dark opacity-40" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <ExamPill status={exam.status} />
                <Chip tone="ink" className="border border-ink-700">{exam.type}</Chip>
                <Chip tone="ink" className="border border-ink-700">{exam.level}</Chip>
              </div>
              <h1 className="font-display mt-4 text-2xl font-extrabold leading-snug text-white sm:text-3xl">{exam.title}</h1>
              <p className="mt-3 leading-7 text-ink-300">{exam.desc}</p>
            </div>
          </div>
          <div className="p-7">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { l: "المدة", v: `${exam.durationMin} دقيقة`, icon: <IcClock size={18} /> },
                { l: "الأسئلة", v: `${exam.questions.length}`, icon: <IcInfo size={18} /> },
                { l: "مجموع النقاط", v: `${total} نقطة`, icon: <IcTrophy size={18} /> },
                { l: "عتبة النجاح", v: `${exam.passPct}%`, icon: <IcFlag size={18} /> },
              ].map((m) => (
                <div key={m.l} className="rounded-xl border border-ink-200 bg-ink-50/60 p-3.5 text-center">
                  <span className="mx-auto mb-1.5 grid size-9 place-items-center rounded-lg bg-white text-primary-600 shadow-sm">{m.icon}</span>
                  <p className="font-display text-lg font-bold text-ink-900">{m.v}</p>
                  <p className="text-xs font-semibold text-ink-400">{m.l}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-ink-400">
              الفترة: من {fmtDateTime(exam.start)} إلى {fmtDateTime(exam.end)} · محاولة واحدة متاحة
            </p>
            <div className="mt-5">
              <Alert tone="info" title="قبل أن تبدأ">
                <ul className="list-disc space-y-1 ps-4">
                  <li>تُحفظ إجاباتك تلقائيًا بعد كل اختيار.</li>
                  <li>عند انتهاء الوقت يُسلَّم الامتحان تلقائيًا بما أنجزته.</li>
                  <li>أسئلة الاختيار المتعدد تُحتسب نقاطها عند المطابقة التامة فقط.</li>
                  <li>يمكنك التنقل بحرية بين الأسئلة قبل التسليم.</li>
                </ul>
              </Alert>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Btn onClick={start} className="h-12 flex-1 text-base sm:flex-none sm:px-8">بدء الامتحان الآن</Btn>
              <Link to="/student/exams" className="inline-flex h-12 items-center rounded-lg border border-ink-200 bg-white px-6 text-sm font-bold text-ink-600 transition-all hover:border-primary-400 hover:text-primary-700">
                عودة للقائمة
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* ====== شاشة الحل ====== */
  const timerTone =
    remaining <= 120 ? "bg-rose-100 text-rose-700 timer-danger" : remaining <= 300 ? "bg-amber-100 text-amber-800" : "bg-ink-100 text-ink-700";

  return (
    <div className="flex min-h-screen flex-col bg-paper pb-24">
      {/* الرأس الثابت */}
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/92 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 pt-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setExitOpen(true)} className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700" aria-label="خروج من الامتحان">
              <IcXCircle size={20} />
            </button>
            <h1 className="font-display min-w-0 flex-1 truncate text-[15px] font-bold text-ink-900 sm:text-base">{exam.title}</h1>
            <span className={cx("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-code text-sm font-bold", timerTone)} dir="ltr" aria-label={`الوقت المتبقي ${fmtClock(remaining)}`}>
              <IcClock size={15} /> {fmtClock(remaining)}
            </span>
          </div>
          <div className="flex items-center gap-3 pb-3 pt-2.5">
            <Bar value={(answeredCount / exam.questions.length) * 100} className="flex-1" tone={answeredCount === exam.questions.length ? "bg-emerald-500" : "bg-primary-600"} />
            <span className="whitespace-nowrap text-xs font-bold text-ink-500">أُجيب {answeredCount} من {exam.questions.length}</span>
            <span aria-live="polite" className={cx(
              "hidden items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-bold sm:inline-flex",
              saveState === "offline" ? "bg-amber-100 text-amber-800" : saveState === "saving" ? "bg-ink-100 text-ink-500" : "bg-emerald-100 text-emerald-700",
            )}>
              {saveState === "offline" ? (<><IcWifiOff size={12} /> حفظ محلي</>) : saveState === "saving" ? (<><span className="size-2 animate-pulse rounded-full bg-ink-400" /> جارٍ الحفظ…</>) : (<><IcCheck size={12} /> حُفظ تلقائيًا</>)}
            </span>
          </div>
        </div>
      </header>

      {/* السؤال */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        {!online && (
          <div className="mb-5"><Alert tone="warning" title="انقطع الاتصال">لا تقلق — إجاباتك محفوظة على جهازك وستُزامَن فور عودة الاتصال.</Alert></div>
        )}
        <Card className="anim-fade-up p-6 sm:p-8" key={q.id}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-code rounded-lg bg-ink-900 px-2.5 py-1 text-xs font-bold text-accent-300" dir="ltr">Q{idx + 1}/{exam.questions.length}</span>
            <Chip tone="gold">{q.points} {q.points >= 3 ? "نقاط" : "نقطتان"}</Chip>
            {q.kind === "single" ? (
              <Chip tone="sky"><IcCircle size={13} /> إجابة واحدة</Chip>
            ) : (
              <Chip tone="accent"><IcSquare size={13} /> إجابات متعددة</Chip>
            )}
          </div>
          <h2 className="font-display mt-4 text-xl font-bold leading-9 text-ink-900 sm:text-[22px]">{q.text}</h2>
          {q.kind === "multi" && (
            <p className="mt-1.5 text-[13px] font-semibold text-accent-700">اختر كل الإجابات الصحيحة — تُحتسب النقطة كاملة عند المطابقة التامة.</p>
          )}
          <div className="mt-6 space-y-3" role={q.kind === "single" ? "radiogroup" : "group"} aria-label={q.text}>
            {q.options.map((opt, oi) => {
              const selected = picked.includes(oi);
              return (
                <label
                  key={oi}
                  className={cx(
                    "flex cursor-pointer items-start gap-3.5 rounded-xl border-2 p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-300",
                    selected ? "border-primary-500 bg-primary-50 shadow-sm" : "border-ink-200 bg-white hover:border-primary-300 hover:bg-primary-50/40",
                  )}
                >
                  <input
                    type={q.kind === "single" ? "radio" : "checkbox"}
                    name={q.id}
                    checked={selected}
                    onChange={() => toggle(oi)}
                    className="sr-only"
                  />
                  <span
                    className={cx(
                      "mt-0.5 grid size-6 shrink-0 place-items-center border-2 transition-all",
                      q.kind === "single" ? "rounded-full" : "rounded-md",
                      selected ? "border-primary-600 bg-primary-600 text-white" : "border-ink-300 bg-white text-transparent",
                    )}
                  >
                    <IcCheck size={14} />
                  </span>
                  <span className="text-[15.5px] font-semibold leading-7 text-ink-700" dir="auto">{opt}</span>
                </label>
              );
            })}
          </div>
        </Card>

        {/* شبكة الأسئلة */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {exam.questions.map((qq, i) => {
            const done = (answers[qq.id] ?? []).length > 0;
            return (
              <button
                key={qq.id}
                onClick={() => setIdx(i)}
                aria-label={`الانتقال إلى السؤال ${i + 1}${done ? " (مُجاب)" : " (بدون إجابة)"}`}
                aria-current={i === idx}
                className={cx(
                  "size-10 rounded-lg text-sm font-bold transition-all",
                  i === idx && "ring-2 ring-primary-500 ring-offset-2",
                  done ? "bg-primary-600 text-white shadow-sm" : "border border-ink-200 bg-white text-ink-500 hover:border-primary-300 hover:text-primary-700",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </main>

      {/* شريط التنقل السفلي */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Btn v="outline" sm onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} icon={<IcChevronEnd size={17} />} className="sm:h-11 sm:px-5 sm:text-[15px]">
            السابق
          </Btn>
          {idx < exam.questions.length - 1 ? (
            <Btn onClick={() => setIdx((i) => Math.min(exam.questions.length - 1, i + 1))} icon={<IcChevronStart size={17} />} className="h-11 px-6">
              التالي
            </Btn>
          ) : (
            <Btn v="gold" onClick={() => { setFinalCheck(false); setConfirmOpen(true); }} icon={<IcSend size={17} />} className="h-11 px-6">
              تسليم الامتحان
            </Btn>
          )}
        </div>
      </div>

      {/* نافذة تأكيد التسليم */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="تسليم الامتحان"
        footer={
          <>
            <Btn v="ghost" onClick={() => setConfirmOpen(false)}>متابعة الحل</Btn>
            <Btn
              v="success"
              disabled={!finalCheck}
              icon={<IcSend size={17} />}
              onClick={() => {
                submittedRef.current = true;
                finalize(answers, false);
                toast.push({ tone: "success", title: "سُلّم امتحانك بنجاح", desc: "لنتعرف على نتيجتك!" });
                navigate(`/student/exams/${exam.id}/result`);
              }}
            >
              تسليم نهائي
            </Btn>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="font-display text-2xl font-black text-emerald-600">{answeredCount}</p>
              <p className="text-xs font-bold text-emerald-700">أسئلة مُجابة</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="font-display text-2xl font-black text-amber-600">{unanswered.length}</p>
              <p className="text-xs font-bold text-amber-700">بدون إجابة</p>
            </div>
            <div className="rounded-xl bg-ink-50 p-3">
              <p className="font-display text-2xl font-black text-ink-700">{exam.questions.length}</p>
              <p className="text-xs font-bold text-ink-500">المجموع</p>
            </div>
          </div>
          {unanswered.length > 0 && (
            <Alert tone="warning" title="انتبه! أسئلة بدون إجابة">
              <p>الأسئلة التالية ستُحتسب صفرًا إن سلّمت الآن:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {unanswered.map((n) => (
                  <button
                    key={n}
                    onClick={() => { setIdx(n - 1); setConfirmOpen(false); }}
                    className="rounded-lg bg-amber-200/70 px-2.5 py-1 font-code text-xs font-bold text-amber-900 transition-transform hover:scale-105"
                  >
                    سؤال {n}
                  </button>
                ))}
              </div>
            </Alert>
          )}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-ink-200 p-4 transition-colors has-checked:border-primary-400 has-checked:bg-primary-50">
            <input type="checkbox" checked={finalCheck} onChange={(e) => setFinalCheck(e.target.checked)} className="mt-1 size-4 accent-primary-600" />
            <span className="text-sm font-semibold leading-6 text-ink-700">
              أؤكد أنني راجعت إجاباتي وأريد التسليم النهائي — لن أتمكن من التعديل بعده.
            </span>
          </label>
        </div>
      </Modal>

      {/* نافذة الخروج */}
      <Modal
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        title="مغادرة الامتحان؟"
        footer={
          <>
            <Btn v="ghost" onClick={() => setExitOpen(false)}>البقاء في الامتحان</Btn>
            <Btn v="danger" onClick={() => navigate("/student/exams")}>مغادرة</Btn>
          </>
        }
      >
        <p className="leading-7 text-ink-600">
          إجاباتك <strong>محفوظة</strong> ويمكنك العودة لإكمال الامتحان في أي وقت قبل نهاية الفترة.
          لكن انتبه: العدّاد يستمر في العمل ولن يتوقف.
        </p>
      </Modal>

      {/* انتهاء الوقت */}
      <Modal
        open={timeUpOpen}
        onClose={() => navigate(`/student/exams/${exam.id}/result`)}
        title="انتهى الوقت!"
        footer={<Btn onClick={() => navigate(`/student/exams/${exam.id}/result`)}>عرض النتيجة</Btn>}
      >
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-100 text-amber-600"><IcClock size={32} /></span>
          <p className="mt-4 leading-7 text-ink-600">
            انتهى وقت الامتحان، وقد <strong>سُلّم تلقائيًا</strong> بالإجابات التي سجلتها ({answeredCount} من {exam.questions.length} سؤالًا).
          </p>
        </div>
      </Modal>
    </div>
  );
}

/* ================== شاشة النتيجة ================== */

export function ExamResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exam = EXAMS.find((e) => e.id === id);
  const [result] = useState<StoredResult | null>(() =>
    id ? loadJSON<StoredResult>(RES_KEY(id)) ?? exam?.storedResult ?? null : null,
  );
  usePageTitle("نتيجة الامتحان");

  useEffect(() => {
    if (!result) return;
    const pct = Math.round((result.score / result.total) * 100);
    if (pct >= 85 && !prefersReduced()) {
      confetti({ particleCount: 150, spread: 75, origin: { y: 0.55 }, colors: ["#4353C4", "#38CDEB", "#FBC556", "#10B981"] });
    }
  }, [result]);

  if (!exam) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <Alert tone="warning" title="امتحان غير موجود">تحقق من الرابط أو عد إلى قائمة الامتحانات.</Alert>
      </div>
    );
  }

  /* النتائج غير متاحة بعد (سياسة الأستاذ) */
  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="p-10 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-primary-100 text-primary-600"><IcLock size={38} /></span>
          <h1 className="font-display mt-5 text-2xl font-extrabold text-ink-900">النتائج غير متاحة بعد</h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-ink-500">
            اختار الأستاذ نشر نتائج «{exam.title}» في وقت لاحق. ستصلك إشعار داخل المنصة فور صدورها — لا داعي للقلق.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/student/exams" className="inline-flex h-11 items-center rounded-lg bg-primary-600 px-6 text-sm font-bold text-white">قائمة الامتحانات</Link>
            <Link to="/student" className="inline-flex h-11 items-center rounded-lg border border-ink-200 bg-white px-6 text-sm font-bold text-ink-600">لوحة البداية</Link>
          </div>
        </Card>
      </div>
    );
  }

  const pct = Math.round((result.score / result.total) * 100);
  const tier =
    pct >= 85
      ? { label: "ممتاز!", msg: "أداء رائع يُحتذى به — واصل على هذا الإيقاع!", color: "#059669", icon: <IcTrophy size={26} />, chip: "bg-emerald-100 text-emerald-700" }
      : pct >= 70
        ? { label: "جيد جدًا!", msg: "خطوة صغيرة تفصلك عن القمة — مراجعة قصيرة وستصل.", color: "#4353C4", icon: <IcCheckCircle size={26} />, chip: "bg-primary-100 text-primary-700" }
        : pct >= 50
          ? { label: "جيد", msg: "تجاوزت عتبة النجاح! ركّز على الأسئلة التي أخطأت فيها وستتحسن بسرعة.", color: "#D98A1F", icon: <IcCheckCircle size={26} />, chip: "bg-gold-400/25 text-gold-700" }
          : { label: "لا بأس أبدًا", msg: "كل محاولة تقرّبك من الفهم. راجع التصحيح وأعد المحاولة بثقة — أنت قادر.", color: "#E11D48", icon: <IcInfo size={26} />, chip: "bg-rose-100 text-rose-700" };
  const passed = pct >= exam.passPct;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Card className="anim-fade-up overflow-hidden">
        <div className="grid items-center gap-8 p-8 sm:grid-cols-[auto_1fr] sm:p-10">
          <div className="mx-auto">
            <Ring value={pct} color={tier.color} size={168}>
              <div className="text-center">
                <p className="font-display text-4xl font-black text-ink-900">{pct}<span className="text-lg">%</span></p>
                <p className="mt-0.5 text-xs font-bold text-ink-400">النسبة المئوية</p>
              </div>
            </Ring>
          </div>
          <div className="text-center sm:text-start">
            <span className={cx("inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold", tier.chip)}>
              {tier.icon} {tier.label}
            </span>
            <h1 className="font-display mt-3 text-3xl font-black text-ink-900">
              <span className="font-code" dir="ltr">{result.score} / {result.total}</span> نقطة
            </h1>
            <p className="mt-2 leading-7 text-ink-500">{tier.msg}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Chip tone={passed ? "emerald" : "rose"}>{passed ? "ناجح" : "دون العتبة"} — عتبة النجاح {exam.passPct}%</Chip>
              <Chip tone="neutral">{exam.title}</Chip>
            </div>
          </div>
        </div>
        {result.autoSubmitted && (
          <div className="border-t border-ink-100 p-5">
            <Alert tone="warning" title="تسليم تلقائي">انتهى وقت الامتحان، فسُلّم تلقائيًا بالإجابات المسجلة.</Alert>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-ink-50/60 px-8 py-4 text-[13px] font-semibold text-ink-400">
          <span>أُنجز في {fmtDateTime(result.finishedAt)}</span>
          <span>{exam.type} · {exam.level}</span>
        </div>
      </Card>

      {/* التصحيح التفصيلي */}
      {exam.showCorrection ? (
        <section className="mt-10">
          <h2 className="font-display mb-5 text-xl font-extrabold text-ink-900">التصحيح التفصيلي</h2>
          <div className="space-y-4">
            {exam.questions.map((qq, i) => {
              const userPick = result.answers[qq.id] ?? [];
              const isRight =
                userPick.length > 0 &&
                [...userPick].sort((a, b) => a - b).join(",") === [...qq.correct].sort((a, b) => a - b).join(",");
              return (
                <Card key={qq.id} className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cx("grid size-8 place-items-center rounded-lg text-white", isRight ? "bg-emerald-500" : "bg-rose-500")}>
                      {isRight ? <IcCheck size={17} /> : <IcXCircle size={17} />}
                    </span>
                    <p className="font-display flex-1 font-bold text-ink-800">س{i + 1}. {qq.text}</p>
                    <Chip tone={isRight ? "emerald" : "rose"}>{isRight ? `+${qq.points}` : "0"} / {qq.points}</Chip>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {qq.options.map((opt, oi) => {
                      const isCorrect = qq.correct.includes(oi);
                      const isPicked = userPick.includes(oi);
                      return (
                        <p
                          key={oi}
                          className={cx(
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-[13.5px] font-semibold",
                            isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : isPicked ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-ink-100 bg-white text-ink-500",
                          )}
                        >
                          {isCorrect ? <IcCheck size={15} /> : isPicked ? <IcXCircle size={15} /> : <span className="size-[15px]" />}
                          <span className="flex-1" dir="auto">{opt}</span>
                          {isCorrect && <span className="text-[11px] font-bold">الصحيحة</span>}
                          {isPicked && !isCorrect && <span className="text-[11px] font-bold">إجابتك</span>}
                          {isPicked && isCorrect && <span className="text-[11px] font-bold">إجابتك ✓</span>}
                        </p>
                      );
                    })}
                  </div>
                  {userPick.length === 0 && <p className="mt-2.5 text-[13px] font-bold text-amber-600">لم تُسجَّل إجابة لهذا السؤال.</p>}
                  {qq.explain && (
                    <p className="mt-3 rounded-lg bg-sky-50 px-3.5 py-2.5 text-[13.5px] leading-6 text-sky-800">
                      <strong>التوضيح: </strong>{qq.explain}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="mt-10">
          <Card className="flex flex-col items-center gap-3 p-8 text-center sm:flex-row sm:text-start">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-500"><IcLock size={24} /></span>
            <div>
              <p className="font-display font-bold text-ink-800">التصحيح التفصيلي غير متاح</p>
              <p className="mt-1 text-sm leading-6 text-ink-500">
                اختار الأستاذ عدم عرض التصحيح التفصيلي لهذا الامتحان — نتيجتك الإجمالية أعلاه هي المتاحة.
              </p>
            </div>
          </Card>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/student/exams" className="inline-flex h-11 items-center rounded-lg border border-ink-200 bg-white px-6 text-sm font-bold text-ink-600 transition-all hover:border-primary-400 hover:text-primary-700">قائمة الامتحانات</Link>
        <button onClick={() => navigate("/student")} className="inline-flex h-11 items-center rounded-lg bg-primary-600 px-6 text-sm font-bold text-white transition-all hover:bg-primary-700">لوحة البداية</button>
      </div>
    </div>
  );
}
