import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cx, downloadCSV, fmtDate, fmtDateTime, timeAgo, usePageTitle } from "../core";
import {
  ARTICLES, EXAMS, GRADE_DIST, LEVELS, PER_QUESTION, PROJECTS, QUESTIONS, STUDENTS,
  type Question, type ReviewItem,
} from "../data";
import {
  Alert, Avatar, Bar, Bars, Btn, Card, Chip, Confirm, Donut, EmptyState, ExamPill, Field, HBar,
  Menu, Modal, SearchBox, SelectInput, Tabs, TextArea, TextInput, Toggle, useToast,
} from "../ui";
import {
  IcArrowDown, IcArrowUp, IcCalendar, IcChart, IcCheck, IcCheckCircle, IcCode, IcCopy, IcDatabase,
  IcDoc, IcDots, IcDownload, IcEye, IcGrip, IcInfo, IcPencil, IcPlus, IcProject, IcSearch,
  IcTrash, IcUsers, IcXCircle,
} from "../icons";
import { teacherStore } from "./teacher-a";

/* ============ بيانات إدارية ============ */

const adminExams = EXAMS.map((e) => ({ ...e }));

const EXAM_STATS: Record<string, { target: number; started: number; completed: number; avg: number; pass: number; high: number; low: number }> = {
  ex1: { target: 32, started: 28, completed: 24, avg: 14.2, pass: 78, high: 19, low: 6 },
  ex2: { target: 32, started: 0, completed: 0, avg: 0, pass: 0, high: 0, low: 0 },
  ex3: { target: 32, started: 31, completed: 30, avg: 13.8, pass: 81, high: 20, low: 5 },
  ex4: { target: 32, started: 29, completed: 27, avg: 12.6, pass: 70, high: 18, low: 4 },
  ex5: { target: 32, started: 25, completed: 25, avg: 15.1, pass: 88, high: 20, low: 7 },
  ex6: { target: 32, started: 0, completed: 0, avg: 0, pass: 0, high: 0, low: 0 },
};

/* ============ إدارة الامتحانات ============ */

export function ExamsAdminPage() {
  usePageTitle("إدارة الامتحانات");
  const toast = useToast();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [preview, setPreview] = useState<(typeof adminExams)[number] | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-500">
          {adminExams.length} امتحانات · {adminExams.filter((e) => e.status === "available").length} متاح الآن · {adminExams.filter((e) => e.status === "draft").length} مسودة
        </p>
        <Btn icon={<IcPlus size={17} />} onClick={() => setCreateOpen(true)}>إنشاء امتحان</Btn>
      </div>

      <div className="space-y-4">
        {adminExams.map((e) => {
          const st = EXAM_STATS[e.id] ?? EXAM_STATS.ex1;
          return (
            <Card key={e.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ExamPill status={e.status} />
                    <Chip tone="neutral">{e.type}</Chip>
                    <Chip tone="sky">{e.level}</Chip>
                  </div>
                  <h2 className="font-display mt-2 text-[17px] font-bold text-ink-900">{e.title}</h2>
                  <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[13px] font-semibold text-ink-400">
                    <span className="flex items-center gap-1.5"><IcCalendar size={14} /> {fmtDate(e.start)} → {fmtDate(e.end)}</span>
                    <span>{e.durationMin} دقيقة · {e.questions.length} أسئلة · عتبة {e.passPct}%</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5 text-center">
                  {[
                    { l: "بدأ", v: st.started },
                    { l: "أكمل", v: st.completed },
                    { l: "المتوسط", v: st.avg ? `${st.avg}` : "—" },
                    { l: "نجاح", v: st.pass ? `${st.pass}%` : "—" },
                  ].map((x) => (
                    <div key={x.l}>
                      <p className="font-display text-lg font-black text-ink-900">{x.v}</p>
                      <p className="text-[11px] font-bold text-ink-400">{x.l}</p>
                    </div>
                  ))}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Btn v="outline" sm icon={<IcChart size={15} />} onClick={() => navigate(`/teacher/exams/${e.id}/stats`)}>الإحصائيات</Btn>
                  <Menu
                    align="end"
                    button={<button aria-label="إجراءات" className="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-400 hover:bg-ink-50 hover:text-ink-700"><IcDots size={17} /></button>}
                    items={[
                      { label: "معاينة كالتلميذ", icon: <IcEye size={15} />, onClick: () => setPreview(e) },
                      { label: "نسخ الامتحان", icon: <IcCopy size={15} />, onClick: () => { adminExams.push({ ...e, id: `copy-${Date.now()}`, title: `${e.title} (نسخة)`, status: "draft" }); setTick((t) => t + 1); toast.push({ tone: "success", title: "نُسخ الامتحان", desc: "أُنشئت نسخة كمسودة." }); } },
                      e.status === "draft"
                        ? { label: "جدولة ونشر", icon: <IcCheck size={15} />, onClick: () => { e.status = "scheduled"; setTick((t) => t + 1); toast.push({ tone: "success", title: "جُدول الامتحان", desc: "سيفتح تلقائيًا في تاريخ البداية." }); } }
                        : { label: "أرشفة", icon: <IcTrash size={15} />, onClick: () => { e.status = "archived"; setTick((t) => t + 1); toast.push({ tone: "info", title: "أُرشف الامتحان" }); } },
                    ]}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <CreateExamModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => setTick((t) => t + 1)} />

      {/* معاينة كالتلميذ */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="معاينة الامتحان — كما يراه التلميذ" wide>
        {preview && (
          <div>
            <div className="dark-zone relative overflow-hidden rounded-xl bg-ink-900 p-5">
              <div className="absolute inset-0 bg-dots-dark opacity-40" />
              <div className="relative">
                <div className="flex flex-wrap gap-2"><ExamPill status={preview.status} /><Chip tone="ink" className="border border-ink-700">{preview.type}</Chip></div>
                <p className="font-display mt-3 text-lg font-extrabold text-white">{preview.title}</p>
                <p className="mt-1 text-sm text-ink-300">{preview.durationMin} دقيقة · {preview.questions.length} أسئلة · عتبة النجاح {preview.passPct}%</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {preview.questions.map((q, i) => (
                <div key={q.id} className="rounded-xl border border-ink-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-code grid size-7 place-items-center rounded-lg bg-ink-900 text-xs font-bold text-accent-300">{i + 1}</span>
                    <Chip tone={q.kind === "single" ? "sky" : "accent"}>{q.kind === "single" ? "إجابة واحدة" : "إجابات متعددة"}</Chip>
                    <Chip tone="gold">{q.points} ن</Chip>
                  </div>
                  <p className="mt-2.5 font-bold text-ink-800">{q.text}</p>
                  <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                    {q.options.map((o, oi) => (
                      <p key={oi} className="flex items-center gap-2.5 rounded-lg border border-ink-100 bg-ink-50/50 px-3 py-2 text-sm font-semibold text-ink-600">
                        <span className="font-code grid size-6 shrink-0 place-items-center rounded-full border border-ink-300 text-[11px] text-ink-400">{["أ", "ب", "ج", "د", "هـ"][oi]}</span>
                        {o}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CreateExamModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({
    title: "", desc: "", type: "فرض إلكتروني" as const, level: LEVELS[2], durationMin: 15,
    passPct: 50, attempts: 1, resultPolicy: "immediate", showCorrection: true, questionIds: [] as string[],
  });

  const save = () => {
    if (f.title.trim().length < 5) { toast.push({ tone: "error", title: "العنوان قصير", desc: "5 أحرف على الأقل." }); return; }
    if (f.questionIds.length === 0) { toast.push({ tone: "error", title: "اختر أسئلة", desc: "ضم سؤالًا واحدًا على الأقل من البنك." }); return; }
    adminExams.unshift({
      ...EXAMS[0],
      id: `new-${Date.now()}`,
      title: f.title.trim(), desc: f.desc || "بدون وصف.", type: f.type, level: f.level,
      durationMin: f.durationMin, passPct: f.passPct, attemptsAllowed: f.attempts,
      resultPolicy: f.resultPolicy as "immediate", showCorrection: f.showCorrection,
      status: "draft", start: new Date(Date.now() + 86400000).toISOString(), end: new Date(Date.now() + 3 * 86400000).toISOString(),
      questions: QUESTIONS.filter((q) => f.questionIds.includes(q.id)),
    });
    onCreated();
    onClose();
    setF({ ...f, title: "", desc: "", questionIds: [] });
    toast.push({ tone: "success", title: "أُنشئ الامتحان كمسودة", desc: "يمكنك جدولته ونشره متى شئت." });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="إنشاء امتحان جديد"
      wide
      footer={<><Btn v="ghost" onClick={onClose}>إلغاء</Btn><Btn onClick={save} icon={<IcCheck size={16} />}>حفظ كمسودة</Btn></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="عنوان الامتحان" required><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="مثال: فرض إلكتروني — الشبكات المحلية" /></Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="الوصف"><TextArea rows={2} value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} placeholder="ما الذي يغطيه هذا الامتحان؟" /></Field>
        </div>
        <Field label="النوع">
          <SelectInput value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as typeof f.type })}>
            <option>تشخيصي</option><option>مرحلي</option><option>فرض إلكتروني</option>
          </SelectInput>
        </Field>
        <Field label="المستوى المستهدف">
          <SelectInput value={f.level} onChange={(e) => setF({ ...f, level: e.target.value })}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </SelectInput>
        </Field>
        <Field label="المدة (دقيقة)"><TextInput type="number" min={5} max={120} value={f.durationMin} onChange={(e) => setF({ ...f, durationMin: +e.target.value })} dir="ltr" className="text-start font-code" /></Field>
        <Field label="عتبة النجاح (%)"><TextInput type="number" min={0} max={100} value={f.passPct} onChange={(e) => setF({ ...f, passPct: +e.target.value })} dir="ltr" className="text-start font-code" /></Field>
        <Field label="عدد المحاولات">
          <SelectInput value={f.attempts} onChange={(e) => setF({ ...f, attempts: +e.target.value })}>
            <option value={1}>محاولة واحدة</option><option value={2}>محاولتان</option><option value={3}>3 محاولات</option>
          </SelectInput>
        </Field>
        <Field label="توقيت ظهور النتيجة">
          <SelectInput value={f.resultPolicy} onChange={(e) => setF({ ...f, resultPolicy: e.target.value })}>
            <option value="immediate">فور التسليم</option>
            <option value="afterEnd">بعد نهاية الفترة</option>
            <option value="manual">يدويًا بقرار مني</option>
          </SelectInput>
        </Field>
        <div className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3 sm:col-span-2">
          <div>
            <p className="text-sm font-bold text-ink-800">السماح بالتصحيح التفصيلي</p>
            <p className="text-xs text-ink-400">يرى التلميذ إجاباته الصحيحة والخاطئة مع التوضيحات</p>
          </div>
          <Toggle checked={f.showCorrection} onChange={(v) => setF({ ...f, showCorrection: v })} label="التصحيح التفصيلي" />
        </div>
      </div>
      <div className="mt-4">
        <p className="mb-2 text-sm font-bold text-ink-700">أسئلة من البنك <span className="font-code text-xs text-ink-400">({f.questionIds.length} محددة)</span></p>
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-ink-200 p-3">
          {QUESTIONS.map((q) => {
            const on = f.questionIds.includes(q.id);
            return (
              <label key={q.id} className={cx("flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all has-checked:border-primary-400 has-checked:bg-primary-50", on ? "border-primary-400 bg-primary-50" : "border-ink-100")}>
                <input type="checkbox" checked={on} onChange={() => setF({ ...f, questionIds: on ? f.questionIds.filter((x) => x !== q.id) : [...f.questionIds, q.id] })} className="mt-1 size-4 accent-primary-600" />
                <span className="text-sm font-semibold leading-6 text-ink-700">{q.text}</span>
                <span className="ms-auto shrink-0"><Chip tone={q.kind === "single" ? "sky" : "accent"}>{q.kind === "single" ? "واحدة" : "متعددة"}</Chip></span>
              </label>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

/* ============ بنك الأسئلة ============ */

const bank = QUESTIONS.map((q) => ({ ...q }));
const LETTERS = ["أ", "ب", "ج", "د", "هـ", "و"];

export function QuestionsPage() {
  usePageTitle("بنك الأسئلة");
  const toast = useToast();
  const [, setTick] = useState(0);
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("الكل");
  const [kind, setKind] = useState("الكل");
  const [editing, setEditing] = useState<Question | "new" | null>(null);
  const [deleteFor, setDeleteFor] = useState<Question | null>(null);
  const [jsonOpen, setJsonOpen] = useState(false);

  const topics = ["الكل", ...Array.from(new Set(bank.map((x) => x.topic)))];
  const list = bank.filter(
    (x) => (topic === "الكل" || x.topic === topic) && (kind === "الكل" || x.kind === kind) && (q.trim() === "" || x.text.includes(q)),
  );

  const move = (i: number, dir: -1 | 1) => {
    const from = bank.indexOf(list[i]);
    const to = from + dir;
    if (to < 0 || to >= bank.length) return;
    const [item] = bank.splice(from, 1);
    bank.splice(to, 0, item);
    setTick((t) => t + 1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-500">{bank.length} سؤالًا في البنك · الأسئلة القابلة للتعديل هي التي لم تُجرَ عليها محاولات بعد</p>
        <div className="flex gap-2.5">
          <Btn v="outline" icon={<IcCode size={16} />} onClick={() => setJsonOpen(true)}>استيراد JSON</Btn>
          <Btn icon={<IcPlus size={17} />} onClick={() => setEditing("new")}>سؤال جديد</Btn>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox value={q} onChange={setQ} placeholder="ابحث في نص السؤال…" className="w-full sm:w-72" />
          <SelectInput value={topic} onChange={(e) => setTopic(e.target.value)} className="w-44" aria-label="الموضوع">
            {topics.map((t) => <option key={t}>{t}</option>)}
          </SelectInput>
          <SelectInput value={kind} onChange={(e) => setKind(e.target.value)} className="w-40" aria-label="النوع">
            <option value="الكل">كل الأنواع</option>
            <option value="single">إجابة واحدة</option>
            <option value="multi">إجابات متعددة</option>
          </SelectInput>
        </div>
      </Card>

      <div className="space-y-3">
        {list.map((x, i) => (
          <Card key={x.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="hidden flex-col items-center gap-1 pt-1 sm:flex">
                <button aria-label="تقديم السؤال" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-7 place-items-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30"><IcArrowUp size={15} /></button>
                <IcGrip size={16} className="text-ink-200" />
                <button aria-label="تأخير السؤال" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="grid size-7 place-items-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30"><IcArrowDown size={15} /></button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="primary">{x.topic}</Chip>
                  <Chip tone={x.kind === "single" ? "sky" : "accent"}>{x.kind === "single" ? "إجابة واحدة" : "إجابات متعددة"}</Chip>
                  <Chip tone="gold">{x.points} نقاط</Chip>
                  {x.hasAttempts && <Chip tone="amber">له محاولات — مقفل</Chip>}
                </div>
                <p className="mt-2 text-[15px] font-bold leading-7 text-ink-800">{x.text}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {x.options.map((o, oi) => (
                    <span key={oi} className={cx("rounded-md px-2.5 py-1 text-xs font-bold", x.correct.includes(oi) ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500")}>
                      {LETTERS[oi]}. {o} {x.correct.includes(oi) && "✓"}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button aria-label="تعديل" onClick={() => setEditing(x)} className="grid size-9 place-items-center rounded-lg text-ink-400 hover:bg-primary-50 hover:text-primary-700"><IcPencil size={16} /></button>
                <button aria-label="نسخ" onClick={() => { bank.push({ ...x, id: `q-${Date.now()}`, hasAttempts: false }); setTick((t) => t + 1); toast.push({ tone: "success", title: "نُسخ السؤال", desc: "أضيفت نسخة في نهاية البنك." }); }} className="grid size-9 place-items-center rounded-lg text-ink-400 hover:bg-primary-50 hover:text-primary-700"><IcCopy size={16} /></button>
                <button
                  aria-label="حذف"
                  onClick={() => {
                    if (x.hasAttempts) toast.push({ tone: "warning", title: "لا يمكن الحذف", desc: "وُجدت محاولات على هذا السؤال — حذفه سيُفقد نتائج التلاميذ." });
                    else setDeleteFor(x);
                  }}
                  className="grid size-9 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <IcTrash size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {list.length === 0 && <EmptyState icon={<IcDatabase size={28} />} title="لا أسئلة مطابقة" desc="عدّل الفلاتر أو أضف سؤالًا جديدًا إلى البنك." />}
      </div>

      <Confirm
        open={!!deleteFor}
        onClose={() => setDeleteFor(null)}
        onYes={() => {
          const i = bank.findIndex((x) => x.id === deleteFor?.id);
          if (i >= 0) bank.splice(i, 1);
          setTick((t) => t + 1);
          toast.push({ tone: "success", title: "حُذف السؤال" });
        }}
        title="حذف السؤال؟"
        desc="سيُحذف السؤال نهائيًا من البنك. هذا الإجراء لا يمكن التراجع عنه."
        yesLabel="حذف نهائي"
        tone="danger"
      />

      {editing && <QuestionEditor q={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => setTick((t) => t + 1)} />}
      <JsonImportModal open={jsonOpen} onClose={() => setJsonOpen(false)} onDone={(n) => { setTick((t) => t + 1); toast.push({ tone: n > 0 ? "success" : "error", title: n > 0 ? `استُورد ${n} أسئلة` : "فشل الاستيراد", desc: n > 0 ? "أُضيفت الأسئلة إلى البنك." : "تأكد من صيغة JSON: مصفوفة من {text, options, correct}." }); }} />
    </div>
  );
}

function QuestionEditor({ q, onClose, onSaved }: { q: Question | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({
    text: q?.text ?? "",
    topic: q?.topic ?? "الخوارزميات",
    kind: q?.kind ?? ("single" as Question["kind"]),
    options: q?.options.length ? [...q.options] : ["", ""],
    correct: q?.correct.length ? [...q.correct] : [0],
    points: q?.points ?? 2,
    explain: q?.explain ?? "",
  });

  const toggleCorrect = (i: number) => {
    if (f.kind === "single") setF({ ...f, correct: [i] });
    else setF({ ...f, correct: f.correct.includes(i) ? f.correct.filter((x) => x !== i) : [...f.correct, i] });
  };

  const save = () => {
    if (f.text.trim().length < 10) { toast.push({ tone: "error", title: "نص السؤال قصير", desc: "10 أحرف على الأقل." }); return; }
    if (f.options.length < 2 || f.options.some((o) => o.trim() === "")) { toast.push({ tone: "error", title: "الخيارات ناقصة", desc: "خياران على الأقل، وجميعها مملوءة." }); return; }
    if (f.kind === "single" && f.correct.length !== 1) { toast.push({ tone: "error", title: "حدد إجابة صحيحة واحدة" }); return; }
    if (f.kind === "multi" && f.correct.length < 2) { toast.push({ tone: "error", title: "اختيار متعدد", desc: "حدد إجابتين صحيحتين على الأقل." }); return; }
    const clean = { text: f.text.trim(), topic: f.topic, kind: f.kind, options: f.options.map((o) => o.trim()), correct: [...f.correct].sort((a, b) => a - b), points: f.points, explain: f.explain.trim() || undefined };
    if (q) Object.assign(q, clean);
    else bank.unshift({ id: `q-${Date.now()}`, hasAttempts: false, ...clean });
    onSaved();
    onClose();
    toast.push({ tone: "success", title: q ? "عُدّل السؤال" : "أُضيف السؤال", desc: f.kind === "multi" ? "نوع: إجابات متعددة — تُحتسب عند المطابقة التامة." : "نوع: إجابة واحدة." });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={q ? "تعديل السؤال" : "سؤال جديد"}
      wide
      footer={<><Btn v="ghost" onClick={onClose}>إلغاء</Btn><Btn onClick={save} icon={<IcCheck size={16} />}>حفظ السؤال</Btn></>}
    >
      <div className="space-y-4">
        <Field label="نص السؤال" required>
          <TextArea rows={2} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder="اكتب السؤال بصيغة واضحة ومباشرة…" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="الموضوع">
            <SelectInput value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>
              {["الخوارزميات", "الترميز", "البرمجة", "بايثون", "الشبكات", "عتاد الحاسوب", "أنظمة التشغيل", "الأمن الرقمي", "مخططات الانسياب"].map((t) => <option key={t}>{t}</option>)}
            </SelectInput>
          </Field>
          <Field label="النقاط"><TextInput type="number" min={1} max={10} value={f.points} onChange={(e) => setF({ ...f, points: +e.target.value })} dir="ltr" className="text-start font-code" /></Field>
          <Field label="نوع الإجابة">
            <div className="flex h-11 gap-2">
              {([["single", "واحدة"], ["multi", "متعددة"]] as const).map(([k, l]) => (
                <button key={k} type="button" onClick={() => setF({ ...f, kind: k, correct: k === "single" ? f.correct.slice(0, 1) : f.correct })}
                  className={cx("flex-1 rounded-lg border-2 text-sm font-bold transition-all", f.kind === k ? "border-primary-500 bg-primary-50 text-primary-700" : "border-ink-200 text-ink-500")}>
                  {l}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <Alert tone={f.kind === "multi" ? "info" : "warning"} title={f.kind === "multi" ? "وضع الإجابات المتعددة" : "وضع الإجابة الواحدة"}>
          {f.kind === "multi" ? "علّم كل الخيارات الصحيحة (اثنان على الأقل). ستُحتسب النقطة كاملة عند المطابقة التامة فقط." : "علّم خيارًا واحدًا صحيحًا فقط."}
        </Alert>
        <div>
          <p className="mb-2 text-sm font-bold text-ink-700">الخيارات <span className="text-xs font-semibold text-ink-400">— اضغط الدائرة لتعليم الصحيح</span></p>
          <div className="space-y-2">
            {f.options.map((o, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleCorrect(i)}
                  aria-label={`تعليم الخيار ${LETTERS[i]} كإجابة صحيحة`}
                  className={cx(
                    "grid size-7 shrink-0 place-items-center border-2 transition-all",
                    f.kind === "single" ? "rounded-full" : "rounded-lg",
                    f.correct.includes(i) ? "border-emerald-500 bg-emerald-500 text-white" : "border-ink-300 text-transparent hover:border-emerald-400",
                  )}
                >
                  <IcCheck size={14} />
                </button>
                <TextInput value={o} onChange={(e) => { const opts = [...f.options]; opts[i] = e.target.value; setF({ ...f, options: opts }); }} placeholder={`الخيار ${LETTERS[i]}`} />
                <button
                  type="button"
                  onClick={() => { if (f.options.length <= 2) return; setF({ ...f, options: f.options.filter((_, x) => x !== i), correct: f.correct.filter((c) => c !== i).map((c) => (c > i ? c - 1 : c)) }); }}
                  disabled={f.options.length <= 2}
                  aria-label="حذف الخيار"
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                >
                  <IcXCircle size={17} />
                </button>
              </div>
            ))}
          </div>
          {f.options.length < 6 && (
            <button type="button" onClick={() => setF({ ...f, options: [...f.options, ""] })} className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700">
              <IcPlus size={15} /> إضافة خيار
            </button>
          )}
        </div>
        <Field label="تفسير / تغذية راجعة (يظهر في التصحيح التفصيلي)">
          <TextArea rows={2} value={f.explain} onChange={(e) => setF({ ...f, explain: e.target.value })} placeholder="لماذا هذه هي الإجابة الصحيحة؟" />
        </Field>
      </div>
    </Modal>
  );
}

function JsonImportModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (n: number) => void }) {
  const [text, setText] = useState("");
  const run = () => {
    try {
      const arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error();
      let n = 0;
      for (const it of arr) {
        if (typeof it.text === "string" && Array.isArray(it.options) && Array.isArray(it.correct)) {
          bank.unshift({ id: `q-${Date.now()}-${n}`, text: it.text, options: it.options, correct: it.correct, kind: it.kind === "multi" ? "multi" : "single", points: it.points ?? 2, topic: it.topic ?? "عام", hasAttempts: false });
          n++;
        }
      }
      onDone(n);
      setText("");
      onClose();
    } catch {
      onDone(0);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="استيراد أسئلة من JSON" footer={<><Btn v="ghost" onClick={onClose}>إلغاء</Btn><Btn onClick={run} icon={<IcCode size={15} />}>استيراد</Btn></>}>
      <p className="text-sm leading-7 text-ink-600">الصق مصفوفة JSON بالصيغة التالية:</p>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-ink-900 p-3 font-code text-[12px] leading-6 text-accent-300" dir="ltr">{`[{"text":"…","options":["…","…"],
  "correct":[0],"kind":"single","points":2}]`}</pre>
      <TextArea rows={5} className="mt-3 font-code" dir="ltr" value={text} onChange={(e) => setText(e.target.value)} placeholder='[{"text": "…"}]' />
    </Modal>
  );
}

/* ============ إحصائيات الامتحان ============ */

export function ExamStatsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  usePageTitle("إحصائيات الامتحان");
  const toast = useToast();
  const exam = adminExams.find((e) => e.id === id) ?? adminExams[0];
  const st = EXAM_STATS[exam.id] ?? EXAM_STATS.ex1;
  const completion = st.target ? Math.round((st.completed / st.target) * 100) : 0;
  const notStarted = STUDENTS.slice(0, 4);
  const notFinished = STUDENTS.slice(4, 6);

  const exportResults = () => {
    downloadCSV(
      `نتائج_${exam.title}.csv`,
      ["التلميذ", "المستوى", "بدأ", "أكمل", "النتيجة /20"],
      STUDENTS.filter((s) => s.status !== "archived").map((s, i) => [
        s.name, `${s.level} ${s.group}`, i < st.started ? "نعم" : "لا", i < st.completed ? "نعم" : "لا",
        i < st.completed ? ((s.avg ?? 10) + (i % 3) - 1).toFixed(1) : "—",
      ]),
    );
    toast.push({ tone: "success", title: "صُدّرت النتائج", desc: "ملف CSV جاهز في تنزيلاتك." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SelectInput value={exam.id} onChange={(e) => navigate(`/teacher/exams/${e.target.value}/stats`)} className="w-72" aria-label="اختيار الامتحان">
            {adminExams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </SelectInput>
          <ExamPill status={exam.status} />
        </div>
        <Btn v="outline" icon={<IcDownload size={16} />} onClick={exportResults}>تصدير النتائج CSV</Btn>
      </div>

      {st.started === 0 ? (
        <EmptyState icon={<IcChart size={30} />} title="لا بيانات بعد" desc="لم يبدأ أي تلميذ هذا الامتحان بعد — ستظهر الإحصائيات هنا فور توفر أول محاولة." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 xl:grid-cols-8">
            {[
              { l: "المستهدفون", v: st.target },
              { l: "بدؤوا", v: st.started },
              { l: "أكملوا", v: st.completed },
              { l: "الإنجاز", v: `${completion}%` },
              { l: "المتوسط", v: `${st.avg}/20` },
              { l: "أعلى نتيجة", v: `${st.high}/20` },
              { l: "أدنى نتيجة", v: `${st.low}/20` },
              { l: "نسبة النجاح", v: `${st.pass}%` },
            ].map((k) => (
              <Card key={k.l} className="p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md">
                <p className="font-display text-[22px] font-black text-ink-900">{k.v}</p>
                <p className="mt-1 text-[11.5px] font-bold text-ink-400">{k.l}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-display mb-4 text-[15px] font-bold text-ink-900">تحليل كل سؤال — نسبة الإجابات الصحيحة</h2>
              <div className="space-y-4">
                {PER_QUESTION.map((q) => <HBar key={q.label} label={q.label} correct={q.correct} wrong={q.wrong} />)}
              </div>
            </Card>
            <div className="space-y-5">
              <Card className="p-5">
                <h2 className="font-display mb-4 text-[15px] font-bold text-ink-900">توزيع النتائج</h2>
                <div className="flex items-center justify-center gap-6">
                  <Donut segments={GRADE_DIST} center={<div className="text-center"><p className="font-display text-xl font-black text-ink-900">{st.avg}</p><p className="text-[10px] font-bold text-ink-400">المتوسط /20</p></div>} size={140} thickness={22} />
                  <ul className="space-y-2">
                    {GRADE_DIST.map((g) => (
                      <li key={g.label} className="flex items-center gap-2 text-[12px] font-bold text-ink-600">
                        <span className="size-2.5 rounded-sm" style={{ background: g.color }} /> {g.label} <span className="font-code text-ink-400">{g.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
              <Card className="p-5">
                <h2 className="font-display mb-3 text-[15px] font-bold text-ink-900">لم يكملوا بعد</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-bold text-amber-600">لم يبدؤوا ({notStarted.length})</p>
                    <ul className="space-y-1.5">
                      {notStarted.map((s) => (
                        <li key={s.id} className="flex items-center gap-2 text-[13px] font-semibold text-ink-600"><Avatar name={s.name} size={22} /> {s.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold text-rose-600">بدؤوا ولم يكملوا ({notFinished.length})</p>
                    <ul className="space-y-1.5">
                      {notFinished.map((s) => (
                        <li key={s.id} className="flex items-center gap-2 text-[13px] font-semibold text-ink-600"><Avatar name={s.name} size={22} /> {s.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs leading-6 text-ink-400">يمكنك إرسال تذكير جماعي من صفحة إدارة التلاميذ في النسخة الكاملة.</p>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============ مراجعة المحتوى ============ */

export function ReviewPage() {
  usePageTitle("مراجعة المحتوى");
  const toast = useToast();
  const [, setTick] = useState(0);
  const [tab, setTab] = useState("articles");
  const [preview, setPreview] = useState<ReviewItem | null>(null);
  const [decision, setDecision] = useState<{ item: ReviewItem; kind: "changes" | "reject" } | null>(null);
  const [note, setNote] = useState("");
  const [noteErr, setNoteErr] = useState("");
  const [unpub, setUnpub] = useState<{ kind: string; title: string } | null>(null);
  const [unpubReason, setUnpubReason] = useState("");

  const qArticles = teacherStore.queue.filter((r) => r.kind === "مقال");
  const qProjects = teacherStore.queue.filter((r) => r.kind === "مشروع");
  const published = [
    ...ARTICLES.filter((a) => a.status === "published").map((a) => ({ kind: "مقال", title: a.title, author: a.author.name, date: a.date })),
    ...PROJECTS.filter((p) => p.status === "published").map((p) => ({ kind: "مشروع", title: p.title, author: p.members[0].name, date: p.date })),
  ];

  const decide = (item: ReviewItem, action: "approve" | "changes" | "reject", reasonText?: string) => {
    teacherStore.queue = teacherStore.queue.filter((r) => r.id !== item.id);
    setPreview(null);
    setDecision(null);
    setNote("");
    setTick((t) => t + 1);
    if (action === "approve") toast.push({ tone: "success", title: "نُشر المحتوى", desc: `«${item.title}» أصبح ظاهرًا في الواجهة العامة، وأُشعر صاحبه.` });
    if (action === "changes") toast.push({ tone: "warning", title: "طُلب التعديل", desc: "أُرسلت ملاحظاتك إلى التلميذ مع إشعار." });
    if (action === "reject") toast.push({ tone: "error", title: "رُفض المحتوى", desc: "سُجّل سبب الرفض وأُشعر التلميذ — يمكنه التعديل وإعادة الإرسال." });
  };

  const openDecision = (item: ReviewItem, kind: "changes" | "reject") => {
    setPreview(null);
    setDecision({ item, kind });
    setNote("");
    setNoteErr("");
  };

  return (
    <div className="space-y-5">
      <Tabs
        tabs={[
          { id: "articles", label: "مقالات بانتظار المراجعة", count: qArticles.length },
          { id: "projects", label: "مشاريع بانتظار المراجعة", count: qProjects.length },
          { id: "published", label: "المنشور حاليًا", count: published.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {(tab === "articles" || tab === "projects") && (
        <div className="space-y-4">
          {(tab === "articles" ? qArticles : qProjects).map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <span className={cx("grid size-12 shrink-0 place-items-center rounded-xl", r.kind === "مقال" ? "bg-primary-100 text-primary-700" : "bg-accent-400/20 text-accent-700")}>
                  {r.kind === "مقال" ? <IcDoc size={22} /> : <IcProject size={22} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-[16px] font-bold text-ink-900">{r.title}</h2>
                    <Chip tone="amber">بانتظار المراجعة</Chip>
                  </div>
                  <p className="mt-1 text-[13.5px] font-semibold text-ink-500">
                    {r.author} · {r.level} · أُرسل {timeAgo(r.submittedAt)}
                  </p>
                  <p className="mt-1 clamp-2 text-sm leading-6 text-ink-400">{r.summary}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Btn v="outline" sm icon={<IcEye size={15} />} onClick={() => setPreview(r)}>معاينة</Btn>
                  <Btn v="success" sm icon={<IcCheck size={15} />} onClick={() => decide(r, "approve")}>موافقة ونشر</Btn>
                  <Btn v="outline" sm icon={<IcPencil size={15} />} onClick={() => openDecision(r, "changes")}>طلب تعديل</Btn>
                  <Btn v="danger" sm icon={<IcXCircle size={15} />} onClick={() => openDecision(r, "reject")}>رفض</Btn>
                </div>
              </div>
            </Card>
          ))}
          {(tab === "articles" ? qArticles : qProjects).length === 0 && (
            <EmptyState icon={<IcCheckCircle size={30} />} title="لا شيء ينتظر المراجعة" desc="كل المحتوى المرسل عولج — ستصلك إشعارات فور وصول أعمال جديدة." />
          )}
        </div>
      )}

      {tab === "published" && (
        <div className="space-y-3">
          {published.map((p, i) => (
            <Card key={i} className="flex flex-wrap items-center gap-3 p-4">
              <span className={cx("grid size-10 shrink-0 place-items-center rounded-lg", p.kind === "مقال" ? "bg-primary-100 text-primary-700" : "bg-accent-400/20 text-accent-700")}>
                {p.kind === "مقال" ? <IcDoc size={18} /> : <IcProject size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-800">{p.title}</p>
                <p className="text-xs font-semibold text-ink-400">{p.kind} · {p.author} · نُشر {fmtDate(p.date)}</p>
              </div>
              <Chip tone="emerald"><IcCheckCircle size={12} /> منشور</Chip>
              <Btn v="ghost" sm onClick={() => { setUnpub(p); setUnpubReason(""); }}>إلغاء النشر</Btn>
            </Card>
          ))}
        </div>
      )}

      {/* معاينة كاملة */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title="معاينة المحتوى"
        wide
        footer={
          preview && (
            <>
              <Btn v="danger" sm icon={<IcXCircle size={15} />} onClick={() => openDecision(preview, "reject")}>رفض</Btn>
              <Btn v="outline" sm icon={<IcPencil size={15} />} onClick={() => openDecision(preview, "changes")}>طلب تعديل</Btn>
              <Btn v="success" sm icon={<IcCheck size={15} />} onClick={() => decide(preview, "approve")}>موافقة ونشر</Btn>
            </>
          )
        }
      >
        {preview && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-200 bg-ink-50/60 p-4">
              <Avatar name={preview.author} size={42} />
              <div>
                <p className="text-sm font-bold text-ink-800">{preview.author}</p>
                <p className="text-xs font-semibold text-ink-400">{preview.level} · أُرسل {timeAgo(preview.submittedAt)}</p>
              </div>
              <Chip tone="amber" className="ms-auto">بانتظار المراجعة</Chip>
            </div>
            <div>
              <h3 className="font-display text-xl font-extrabold text-ink-900">{preview.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-ink-500">{preview.summary}</p>
              <div className="mt-4 space-y-3 border-s-2 border-ink-100 ps-4">
                {preview.body.map((b, i) => <p key={i} className="text-[15px] leading-8 text-ink-700">{b}</p>)}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-ink-700">سجل التغييرات</p>
              <ol className="space-y-2.5 border-s-2 border-dashed border-ink-200 ps-4">
                {preview.history.map((h, i) => (
                  <li key={i} className="relative text-[13px] font-semibold text-ink-500">
                    <span className="absolute -start-[21px] top-1 size-2.5 rounded-full bg-primary-400" />
                    {h.action} — <span className="text-ink-400">{fmtDateTime(h.at)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Modal>

      {/* طلب تعديل / رفض */}
      <Modal
        open={!!decision}
        onClose={() => setDecision(null)}
        title={decision?.kind === "reject" ? "رفض المحتوى" : "طلب تعديل"}
        footer={
          <>
            <Btn v="ghost" onClick={() => setDecision(null)}>إلغاء</Btn>
            <Btn
              v={decision?.kind === "reject" ? "danger" : "primary"}
              onClick={() => {
                if (note.trim().length < 10) { setNoteErr(decision?.kind === "reject" ? "سبب الرفض إلزامي (10 أحرف على الأقل)." : "اكتب ملاحظات واضحة للتلميذ (10 أحرف على الأقل)."); return; }
                if (decision) decide(decision.item, decision.kind, note);
              }}
            >
              {decision?.kind === "reject" ? "تأكيد الرفض" : "إرسال طلب التعديل"}
            </Btn>
          </>
        }
      >
        {decision && (
          <div className="space-y-3">
            <p className="text-sm leading-7 text-ink-600">
              {decision.kind === "reject"
                ? <>سيُرفض «{decision.item.title}» مع إشعار صاحبه. <strong>السبب إلزامي</strong> ليتمكن التلميذ من التحسن.</>
                : <>ستصل ملاحظاتك إلى التلميذ مع إشعار، ويبقى العمل مخفيًا عن الواجهة العامة حتى إعادة إرساله.</>}
            </p>
            <Field label={decision.kind === "reject" ? "سبب الرفض" : "ملاحظات التعديل"} required error={noteErr}>
              <TextArea rows={4} value={note} onChange={(e) => { setNote(e.target.value); setNoteErr(""); }} placeholder={decision.kind === "reject" ? "مثال: المحتوى منقول دون إعادة صياغة…" : "مثال: أضف فقرة عن… وراجع المصطلحات في…"} error={!!noteErr} />
            </Field>
          </div>
        )}
      </Modal>

      {/* إلغاء نشر */}
      <Modal
        open={!!unpub}
        onClose={() => setUnpub(null)}
        title="إلغاء النشر"
        footer={
          <>
            <Btn v="ghost" onClick={() => setUnpub(null)}>تراجع</Btn>
            <Btn
              v="danger"
              onClick={() => {
                if (unpubReason.trim().length < 5) { toast.push({ tone: "error", title: "السبب مطلوب", desc: "سجّل سبب إلغاء النشر." }); return; }
                toast.push({ tone: "warning", title: "أُلغي النشر", desc: `اختفى «${unpub?.title}» من الواجهة العامة وسُجّل السبب في السجل.` });
                setUnpub(null);
              }}
            >
              تأكيد إلغاء النشر
            </Btn>
          </>
        }
      >
        <p className="text-sm leading-7 text-ink-600">سيختفي «{unpub?.title}» فورًا من الواجهة العامة مع بقاء نتائجه وإحصائياته. سُجّل السبب في سجل النشاط.</p>
        <div className="mt-3">
          <Field label="سبب إلغاء النشر" required>
            <TextArea rows={3} value={unpubReason} onChange={(e) => setUnpubReason(e.target.value)} placeholder="مثال: اكتُشف خطأ علمي في الفقرة الثانية…" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

/* ============ التقارير ============ */

export function ReportsPage() {
  usePageTitle("التقارير");
  const toast = useToast();
  const [level, setLevel] = useState("الكل");
  const [examId, setExamId] = useState("ex1");

  const reports: { icon: ReactNode; title: string; desc: string; onExport: () => void }[] = [
    {
      icon: <IcUsers size={22} />, title: "التلاميذ وحالة الدخول", desc: "قائمة كاملة بالتلاميذ، حالتهم، وتاريخ آخر دخول.",
      onExport: () => downloadCSV("التلاميذ_وحالة_الدخول.csv", ["الاسم", "اسم المستخدم", "المستوى", "المجموعة", "الحالة", "سجّل الدخول", "آخر دخول"],
        teacherStore.students.filter((s) => level === "الكل" || s.level === level).map((s) => [s.name, s.username, s.level, s.group, s.status === "active" ? "نشط" : s.status === "suspended" ? "موقوف" : "مؤرشف", s.hasLoggedIn ? "نعم" : "لا", s.lastLogin ? fmtDate(s.lastLogin) : "لم يدخل بعد"])),
    },
    {
      icon: <IcChart size={22} />, title: "نتائج امتحان محدد", desc: "نتائج كل تلميذ في الامتحان الذي تختاره.",
      onExport: () => {
        const ex = adminExams.find((e) => e.id === examId)!;
        downloadCSV(`نتائج_${ex.title}.csv`, ["التلميذ", "المستوى", "النتيجة /20", "الحالة"],
          teacherStore.students.filter((s) => s.status !== "archived").map((s, i) => [s.name, s.level, ((s.avg ?? 10) + (i % 3) - 1).toFixed(1), (s.avg ?? 10) >= 10 ? "ناجح" : "غير ناجح"]));
      },
    },
    {
      icon: <IcDoc size={22} />, title: "ملخص النتائج حسب المستوى", desc: "المتوسط ونسبة النجاح لكل مستوى دراسي.",
      onExport: () => downloadCSV("ملخص_حسب_المستوى.csv", ["المستوى", "عدد التلاميذ", "المتوسط /20", "نسبة النجاح"],
        LEVELS.map((l, i) => [l, [46, 42, 44][i], [12.4, 13.1, 14.2][i], `${[70, 74, 81][i]}%`])),
    },
    {
      icon: <IcCheckCircle size={22} />, title: "نسب الإنجاز", desc: "من بدأ ومن أكمل لكل امتحان منشور.",
      onExport: () => downloadCSV("نسب_الإنجاز.csv", ["الامتحان", "المستهدفون", "بدؤوا", "أكملوا", "نسبة الإنجاز"],
        adminExams.map((e) => { const s = EXAM_STATS[e.id] ?? EXAM_STATS.ex1; return [e.title, s.target, s.started, s.completed, s.target ? `${Math.round((s.completed / s.target) * 100)}%` : "—"]; })),
    },
    {
      icon: <IcProject size={22} />, title: "حالة المحتوى", desc: "كل المقالات والمشاريع بحالاتها الحالية.",
      onExport: () => downloadCSV("حالة_المحتوى.csv", ["النوع", "العنوان", "الصاحب", "الحالة"],
        [
          ...ARTICLES.map((a) => ["مقال", a.title, a.author.name, a.status]),
          ...PROJECTS.map((p) => ["مشروع", p.title, p.members[0].name, p.status]),
        ]),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <SelectInput value={level} onChange={(e) => setLevel(e.target.value)} className="w-48" aria-label="تصفية حسب المستوى">
          <option value="الكل">كل المستويات</option>
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </SelectInput>
        <SelectInput value={examId} onChange={(e) => setExamId(e.target.value)} className="w-72" aria-label="اختيار الامتحان">
          {adminExams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </SelectInput>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.title} hover className="flex flex-col p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-primary-100 text-primary-700">{r.icon}</span>
            <h2 className="font-display mt-3 text-[16px] font-bold text-ink-900">{r.title}</h2>
            <p className="mt-1 flex-1 text-sm leading-6 text-ink-500">{r.desc}</p>
            <Btn v="outline" sm icon={<IcDownload size={15} />} className="mt-4 w-fit" onClick={() => { r.onExport(); toast.push({ tone: "success", title: "صُدّر التقرير", desc: `${r.title} — CSV بترميز عربي سليم.` }); }}>
              تصدير CSV
            </Btn>
          </Card>
        ))}
        <Card className="dark-zone relative flex flex-col overflow-hidden p-5">
          <div className="absolute inset-0 bg-dots-dark opacity-40" />
          <div className="relative">
            <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-accent-300"><IcInfo size={22} /></span>
            <h2 className="font-display mt-3 text-[16px] font-bold text-white">جدولة التقارير البريدية</h2>
            <p className="mt-1 text-sm leading-6 text-ink-300">استلم ملخصًا أسبوعيًا تلقائيًا على بريدك — متاحة في إصدار قادم.</p>
            <Chip tone="ink" className="mt-4 border border-ink-700">قريبًا</Chip>
          </div>
        </Card>
      </div>
    </div>
  );
}
