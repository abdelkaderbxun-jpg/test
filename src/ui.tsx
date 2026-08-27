import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { cx, prefersReduced } from "./core";
import type { ContentStatus, ExamStatus } from "./data";
import {
  IcAlert, IcArchive, IcCalendar, IcCheck, IcCheckCircle, IcChevronDown, IcChevronEnd,
  IcClock, IcFlag, IcInfo, IcPencil, IcPlay, IcRefresh, IcSearch, IcWifiOff, IcX, IcXCircle,
} from "./icons";

/* ================== الأزرار ================== */

type BtnVariant = "primary" | "dark" | "outline" | "ghost" | "danger" | "success" | "gold";

const BTN_STYLES: Record<BtnVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-600/25",
  dark: "bg-ink-900 text-white hover:bg-ink-700",
  outline: "border border-ink-200 bg-white text-ink-700 hover:border-primary-400 hover:text-primary-700",
  ghost: "text-ink-600 hover:bg-ink-900/5 hover:text-ink-800",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/25",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  gold: "bg-gold-400 text-ink-900 hover:bg-gold-500 shadow-sm shadow-gold-500/30",
};

export function Btn({
  v = "primary",
  sm,
  loading,
  icon,
  className,
  children,
  full,
  ...rest
}: {
  v?: BtnVariant;
  sm?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  full?: boolean;
  className?: string;
  children?: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold select-none transition-all duration-200 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none",
        sm ? "h-9 px-3.5 text-sm" : "h-11 px-5 text-[15px]",
        full && "w-full",
        BTN_STYLES[v],
        className,
      )}
    >
      {loading ? (
        <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

/* ================== الشارات والحالات ================== */

export const CONTENT_STATUS: Record<
  ContentStatus,
  { label: string; cls: string; dot: string; Icon: (p: { size?: number }) => ReactNode }
> = {
  draft: { label: "مسودة", cls: "bg-ink-100 text-ink-600", dot: "bg-ink-400", Icon: (p) => <IcPencil {...p} /> },
  review: { label: "قيد المراجعة", cls: "bg-amber-100 text-amber-800", dot: "bg-amber-500", Icon: (p) => <IcClock {...p} /> },
  changes: { label: "يحتاج تعديلًا", cls: "bg-orange-100 text-orange-800", dot: "bg-orange-500", Icon: (p) => <IcRefresh {...p} /> },
  rejected: { label: "مرفوض", cls: "bg-rose-100 text-rose-700", dot: "bg-rose-500", Icon: (p) => <IcXCircle {...p} /> },
  published: { label: "منشور", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", Icon: (p) => <IcCheckCircle {...p} /> },
};

export const EXAM_STATUS: Record<
  ExamStatus,
  { label: string; cls: string; dot: string; Icon: (p: { size?: number }) => ReactNode }
> = {
  available: { label: "متاح الآن", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", Icon: (p) => <IcPlay {...p} /> },
  upcoming: { label: "قادم", cls: "bg-sky-100 text-sky-700", dot: "bg-sky-500", Icon: (p) => <IcCalendar {...p} /> },
  scheduled: { label: "مجدول", cls: "bg-sky-100 text-sky-700", dot: "bg-sky-500", Icon: (p) => <IcCalendar {...p} /> },
  completed: { label: "مكتمل", cls: "bg-primary-100 text-primary-700", dot: "bg-primary-500", Icon: (p) => <IcCheckCircle {...p} /> },
  ended: { label: "منتهٍ", cls: "bg-ink-100 text-ink-500", dot: "bg-ink-400", Icon: (p) => <IcFlag {...p} /> },
  draft: { label: "مسودة", cls: "bg-ink-100 text-ink-500", dot: "bg-ink-300", Icon: (p) => <IcPencil {...p} /> },
  archived: { label: "مؤرشف", cls: "bg-ink-100 text-ink-500", dot: "bg-ink-300", Icon: (p) => <IcArchive {...p} /> },
};

export function Chip({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "primary" | "accent" | "gold" | "emerald" | "rose" | "amber" | "sky" | "ink";
  children: ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink-100 text-ink-600",
    primary: "bg-primary-100 text-primary-700",
    accent: "bg-accent-400/15 text-accent-700",
    gold: "bg-gold-400/20 text-gold-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-800",
    sky: "bg-sky-100 text-sky-700",
    ink: "bg-ink-900 text-ink-100",
  };
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: ContentStatus }) {
  const m = CONTENT_STATUS[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold", m.cls)}>
      <span className={cx("size-1.5 rounded-full", m.dot)} />
      {m.Icon({ size: 13 })}
      {m.label}
    </span>
  );
}

export function ExamPill({ status }: { status: ExamStatus }) {
  const m = EXAM_STATUS[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold", m.cls)}>
      <span className={cx("size-1.5 rounded-full", m.dot)} />
      {m.Icon({ size: 13 })}
      {m.label}
    </span>
  );
}

/* ================== البطاقات ================== */

export function Card({
  children,
  className,
  hover,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-xl border border-ink-200/70 bg-white shadow-[0_1px_2px_rgba(10,22,51,0.05)]",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_-14px_rgba(26,46,92,0.28)] hover:border-primary-300",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ================== النماذج ================== */

export function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-ink-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-rose-600">
          <IcAlert size={13} /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputCls = (error?: boolean) =>
  cx(
    "w-full h-11 rounded-lg border bg-white px-3.5 text-[15px] text-ink-800 placeholder:text-ink-300 outline-none transition-all",
    error
      ? "border-rose-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-500"
      : "border-ink-200 hover:border-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
  );

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const { error, className, ...rest } = props;
  return <input {...rest} className={cx(inputCls(error), className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  const { error, className, ...rest } = props;
  return <textarea {...rest} className={cx(inputCls(error), "h-auto min-h-28 py-2.5 leading-7", className)} />;
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean },
) {
  const { error, className, children, ...rest } = props;
  return (
    <div className={cx("relative", className)}>
      <select {...rest} className={cx(inputCls(error), "w-full appearance-none pe-9 cursor-pointer")}>
        {children}
      </select>
      <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-ink-400">
        <IcChevronDown size={16} />
      </span>
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cx("relative", className)}>
      <span className="absolute start-3 top-1/2 -translate-y-1/2 text-ink-400">
        <IcSearch size={17} />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "ابحث…"}
        className={cx(inputCls(), "ps-9")}
        type="search"
        aria-label={placeholder ?? "بحث"}
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary-600" : "bg-ink-200",
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
          checked ? "start-[22px]" : "start-0.5",
        )}
      />
    </button>
  );
}

/* ================== النوافذ ================== */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-[2px] anim-fade-in sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cx(
          "anim-pop flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        {title !== undefined && (
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-base font-bold text-ink-800">{title}</h2>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="grid size-9 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
            >
              <IcX size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/60 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Confirm({
  open,
  onClose,
  onYes,
  title,
  desc,
  yesLabel = "تأكيد",
  tone = "primary",
  children,
}: {
  open: boolean;
  onClose: () => void;
  onYes: () => void;
  title: string;
  desc?: string;
  yesLabel?: string;
  tone?: "primary" | "danger" | "success";
  children?: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Btn v="ghost" onClick={onClose}>إلغاء</Btn>
          <Btn v={tone === "danger" ? "danger" : tone === "success" ? "success" : "primary"} onClick={() => { onYes(); onClose(); }}>
            {yesLabel}
          </Btn>
        </>
      }
    >
      {desc && <p className="leading-7 text-ink-600">{desc}</p>}
      {children}
    </Modal>
  );
}

/* ================== التبويبات ================== */

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-ink-200">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            "relative whitespace-nowrap px-4 py-2.5 text-sm font-bold transition-colors",
            active === t.id ? "text-primary-700" : "text-ink-400 hover:text-ink-600",
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={cx(
              "ms-2 rounded-md px-1.5 py-0.5 text-[11px] font-bold",
              active === t.id ? "bg-primary-100 text-primary-700" : "bg-ink-100 text-ink-500",
            )}>
              {t.count}
            </span>
          )}
          {active === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary-600" />}
        </button>
      ))}
    </div>
  );
}

/* ================== الحالات ================== */

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center">
      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-ink-100 text-ink-400">{icon}</div>
      <h3 className="font-display text-lg font-bold text-ink-700">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-ink-400">{desc}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/60 px-6 py-12 text-center">
      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-rose-100 text-rose-500">
        <IcAlert size={30} />
      </div>
      <h3 className="font-display text-lg font-bold text-ink-800">حدث خطأ غير متوقع</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-ink-500">
        تعذّر إتمام العملية. لم تُفقد بياناتك — أعد المحاولة، وإن تكرر الخطأ فأخبر أستاذك.
      </p>
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Btn v="outline" icon={<IcRefresh size={17} />} onClick={onRetry}>إعادة المحاولة</Btn>
        </div>
      )}
    </div>
  );
}

export function OfflineBox() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
      <IcWifiOff size={20} />
      أنت غير متصل بالإنترنت — ستُحفظ تغييراتك محليًا وتُزامَن عند عودة الاتصال.
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton rounded-lg", className)} aria-hidden />;
}

/* ================== التنبيهات ================== */

const ALERT_TONES = {
  info: { cls: "bg-sky-50 border-sky-200 text-sky-800", Icon: IcInfo },
  success: { cls: "bg-emerald-50 border-emerald-200 text-emerald-800", Icon: IcCheckCircle },
  warning: { cls: "bg-amber-50 border-amber-200 text-amber-800", Icon: IcAlert },
  danger: { cls: "bg-rose-50 border-rose-200 text-rose-800", Icon: IcAlert },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof ALERT_TONES;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const t = ALERT_TONES[tone];
  const Icon = t.Icon;
  return (
    <div className={cx("flex gap-3 rounded-xl border px-4 py-3.5 text-sm leading-6", t.cls, className)}>
      <span className="mt-0.5 shrink-0"><Icon size={19} /></span>
      <div>
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={cx(title && "mt-0.5", "opacity-90")}>{children}</div>}
      </div>
    </div>
  );
}

/* ================== التنقل ================== */

export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="مسار التنقل" className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-ink-400">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <IcChevronEnd size={13} className="rotate-180 text-ink-300" />}
          {it.to ? (
            <Link to={it.to} className="transition-colors hover:text-primary-600">{it.label}</Link>
          ) : (
            <span className="text-ink-600">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ================== مؤشرات ================== */

export function Bar({ value, tone = "bg-primary-600", className }: { value: number; tone?: string; className?: string }) {
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full bg-ink-100", className)}>
      <div
        className={cx("h-full rounded-full transition-all duration-700 ease-out", tone)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Ring({
  value,
  size = 150,
  stroke = 13,
  color = "#4353C4",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [off, setOff] = useState(prefersReduced() ? c * (1 - value / 100) : c);
  useEffect(() => {
    const id = setTimeout(() => setOff(c * (1 - value / 100)), 250);
    return () => clearTimeout(id);
  }, [value, c]);
  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f6" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function Spark({ data, color = "#4353C4", w = 90, h = 30 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="overflow-visible">
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.1" stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Bars({ data, color = "#4353C4", height = 120, labels }: { data: number[]; color?: string; height?: number; labels?: string[] }) {
  const max = Math.max(...data);
  return (
    <div>
      <div className="flex items-end gap-[3%]" style={{ height }}>
        {data.map((v, i) => (
          <div key={i} className="group relative flex-1">
            <div
              className="w-full rounded-t-md transition-all duration-500 group-hover:opacity-80"
              style={{ height: `${(v / max) * height}px`, background: color, opacity: 0.35 + 0.65 * (v / max) }}
              title={`${labels?.[i] ?? i + 1}: ${v}`}
            />
          </div>
        ))}
      </div>
      {labels && (
        <div className="mt-1.5 flex gap-[3%] text-[10px] font-semibold text-ink-400">
          {labels.map((l, i) => (
            <span key={i} className="flex-1 text-center">{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Donut({
  segments,
  size = 168,
  thickness = 26,
  center,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  center?: ReactNode;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef1f9" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const off = -acc * c;
          acc += frac;
          return (
            <circle
              key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={thickness}
              strokeDasharray={`${frac * c - 2} ${c - frac * c + 2}`}
              strokeDashoffset={off}
              strokeLinecap="butt"
            >
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center">{center}</div>
    </div>
  );
}

export function HBar({ label, correct, wrong }: { label: string; correct: number; wrong: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-[13px]">
        <span className="font-semibold text-ink-600">{label}</span>
        <span className="font-code text-xs font-semibold text-ink-500" dir="ltr">{correct}%</span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full rounded-s-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${correct}%` }}
          title={`إجابات صحيحة ${correct}%`}
        />
        <div className="h-full flex-1 bg-rose-300" title={`إجابات خاطئة ${wrong}%`} />
      </div>
    </div>
  );
}

/* ================== أفاتار وغلاف ================== */

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const parts = name.replace(/^(الأستاذ|التلميذ)\s*/, "").split(" ");
  const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <span
      className={cx("grid shrink-0 place-items-center rounded-full font-display font-bold", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `hsl(${h} 62% 90%)`,
        color: `hsl(${h} 45% 30%)`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function CoverImg({
  src,
  alt,
  className,
  icon = "code",
}: {
  src?: string;
  alt: string;
  className?: string;
  icon?: "code" | "doc";
}) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cx(
          "relative grid place-items-center overflow-hidden bg-gradient-to-br from-ink-800 via-ink-900 to-primary-900",
          className,
        )}
      >
        <div className="absolute inset-0 bg-dots-dark opacity-60" />
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#38CDEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="relative opacity-80">
          {icon === "code" ? (
            <path d="M8 7 3.5 12 8 17M16 7l4.5 5L16 17" />
          ) : (
            <>
              <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
              <path d="M14 3v4h4M9.5 12h5M9.5 15.5h5" />
            </>
          )}
        </svg>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} className={cx("object-cover", className)} />;
}

/* ================== القائمة المنسدلة ================== */

export function Menu({
  button,
  items,
  align = "end",
}: {
  button: ReactNode;
  items: { label: string; icon?: ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean }[];
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{button}</div>
      {open && (
        <div
          className={cx(
            "anim-pop absolute top-full z-40 mt-1.5 min-w-48 overflow-hidden rounded-xl border border-ink-200 bg-white py-1.5 shadow-xl shadow-ink-900/10",
            align === "end" ? "start-0" : "end-0",
          )}
          role="menu"
        >
          {items.map((it, i) => (
            <button
              key={i}
              role="menuitem"
              disabled={it.disabled}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={cx(
                "flex w-full items-center gap-2.5 px-4 py-2.5 text-start text-sm font-semibold transition-colors disabled:opacity-40",
                it.danger ? "text-rose-600 hover:bg-rose-50" : "text-ink-600 hover:bg-ink-50",
              )}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================== الدرج الجانبي ================== */

export function Drawer({
  open,
  onClose,
  side = "start",
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "start" | "end";
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-ink-950/50 backdrop-blur-[2px] anim-fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={cx(
          "absolute top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-white shadow-2xl",
          side === "start" ? "start-0 anim-[slideStart_.3s_ease]" : "end-0",
        )}
        style={{ animationName: "slideInStart" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ================== التوست ================== */

interface ToastItem {
  id: number;
  tone: "success" | "error" | "info" | "warning";
  title: string;
  desc?: string;
}

const ToastCtx = createContext<{ push: (t: Omit<ToastItem, "id">) => void }>(null!);
export const useToast = () => useContext(ToastCtx);

const TOAST_META = {
  success: { cls: "border-emerald-500 text-emerald-600", Icon: IcCheckCircle },
  error: { cls: "border-rose-500 text-rose-600", Icon: IcXCircle },
  info: { cls: "border-sky-500 text-sky-600", Icon: IcInfo },
  warning: { cls: "border-amber-500 text-amber-600", Icon: IcAlert },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<ToastItem[]>([]);
  const idRef = useRef(1);

  const push = (t: Omit<ToastItem, "id">) => {
    const id = idRef.current++;
    setList((l) => [...l.slice(-3), { ...t, id }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 4600);
  };

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="no-print pointer-events-none fixed bottom-20 start-4 z-[110] flex w-[min(92vw,360px)] flex-col gap-2.5 sm:bottom-5">
        {list.map((t) => {
          const m = TOAST_META[t.tone];
          const Icon = m.Icon;
          return (
            <div
              key={t.id}
              className={cx(
                "anim-toast pointer-events-auto flex items-start gap-3 rounded-xl border border-ink-200 border-s-4 bg-white px-4 py-3.5 shadow-xl shadow-ink-900/10",
                m.cls,
              )}
            >
              <Icon size={21} />
              <div className="flex-1 text-ink-700">
                <p className="text-sm font-bold text-ink-800">{t.title}</p>
                {t.desc && <p className="mt-0.5 text-[13px] leading-5 text-ink-500">{t.desc}</p>}
              </div>
              <button
                onClick={() => setList((l) => l.filter((x) => x.id !== t.id))}
                aria-label="إغلاق التنبيه"
                className="text-ink-300 transition-colors hover:text-ink-600"
              >
                <IcX size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

/* ================== ترويسة قسم ================== */

export function SectionHead({
  kicker,
  title,
  desc,
  action,
  dark,
}: {
  kicker: string;
  title: string;
  desc?: string;
  action?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className={cx("font-code text-[13px] font-semibold tracking-wide", dark ? "text-accent-300" : "text-accent-600")} dir="ltr">
          <span dir="rtl">{kicker}</span>
        </p>
        <h2 className={cx("font-display mt-2 text-2xl font-extrabold sm:text-[32px] sm:leading-tight", dark ? "text-white" : "text-ink-900")}>
          {title}
        </h2>
        {desc && <p className={cx("mt-2.5 leading-7", dark ? "text-ink-300" : "text-ink-500")}>{desc}</p>}
      </div>
      {action}
    </div>
  );
}
