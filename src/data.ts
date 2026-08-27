/* ============ الأنواع ============ */

export type ContentStatus = "draft" | "review" | "changes" | "rejected" | "published";
export type ExamStatus =
  | "available"
  | "upcoming"
  | "completed"
  | "ended"
  | "scheduled"
  | "draft"
  | "archived";

export interface DemoUser {
  username: string;
  password: string;
  role: "student" | "teacher";
  name: string;
  level?: string;
  group?: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  cover?: string;
  author: { name: string; level: string };
  date: string;
  readMin: number;
  status: ContentStatus;
  tags: string[];
  owner?: boolean;
  note?: string;
  body?: string[];
  code?: { lang: string; text: string };
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  cover?: string;
  members: { name: string; role: string }[];
  date: string;
  kind: "فردي" | "جماعي";
  level: string;
  status: ContentStatus;
  tech: string[];
  link?: { url: string; label: string; verified: boolean };
  owner?: boolean;
  note?: string;
  body?: string[];
}

export interface Question {
  id: string;
  topic: string;
  text: string;
  kind: "single" | "multi";
  options: string[];
  correct: number[];
  points: number;
  explain?: string;
  hasAttempts?: boolean;
}

export interface StoredResult {
  score: number;
  total: number;
  answers: Record<string, number[]>;
  finishedAt: string;
  autoSubmitted?: boolean;
}

export interface Exam {
  id: string;
  title: string;
  desc: string;
  type: "تشخيصي" | "مرحلي" | "فرض إلكتروني";
  level: string;
  durationMin: number;
  start: string;
  end: string;
  status: ExamStatus;
  questions: Question[];
  attemptsAllowed: number;
  passPct: number;
  resultPolicy: "immediate" | "afterEnd" | "manual";
  showCorrection: boolean;
  storedResult?: StoredResult;
}

export interface StudentRow {
  id: string;
  name: string;
  username: string;
  level: string;
  group: string;
  status: "active" | "suspended" | "archived";
  hasLoggedIn: boolean;
  lastLogin: string | null;
  avg: number | null;
}

export interface Notif {
  id: string;
  type: "exam" | "result" | "edit" | "publish" | "info";
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

/* ============ مساعدات تواريخ نسبية ============ */

const daysFromNow = (n: number, h = 9, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

/* ============ الحسابات التجريبية ============ */

export const DEMO_USERS: DemoUser[] = [
  { username: "amina", password: "1234", role: "student", name: "أمينة بنعلي", level: "الثالثة إعدادي", group: "أ" },
  { username: "yassine", password: "1234", role: "student", name: "ياسين الإدريسي", level: "الثالثة إعدادي", group: "أ" },
  { username: "salma", password: "1234", role: "student", name: "سلمى أمرابط", level: "الثالثة إعدادي", group: "ب" },
  { username: "prof", password: "2026", role: "teacher", name: "الأستاذ كريم الإدريسي" },
];

export const CLASSMATES = ["ياسين الإدريسي", "سلمى أمرابط", "عمر تازي", "نور الصقلي"];

export const LEVELS = ["الأولى إعدادي", "الثانية إعدادي", "الثالثة إعدادي"];

/* ============ الأغلفة ============ */

export const COVERS = {
  binary: "https://image.qwenlm.ai/generated-images/fdb331f3-9dba-40cd-8abf-7f16c4a48b87/_result.png",
  python: "https://image.qwenlm.ai/generated-images/539daf12-d992-4260-8a4f-b5154d30752e/_result.png",
  network: "https://image.qwenlm.ai/generated-images/63287b75-5b5b-4e87-8584-c62ddc46fcbf/_result.png",
  robot: "https://image.qwenlm.ai/generated-images/f54f966a-cb6e-4a6c-b187-ecb920fe1f42/_result.png",
  app: "https://image.qwenlm.ai/generated-images/8e2daa04-516e-4d63-a2aa-d6e9b2dd606d/_result.png",
  game: "https://image.qwenlm.ai/generated-images/1161801a-e74d-4c1c-aa1b-cc5d8b564ed8/_result.png",
};

/* ============ الأسئلة ============ */

export const QUESTIONS: Question[] = [
  {
    id: "q1", topic: "الخوارزميات", kind: "single", points: 2, hasAttempts: true,
    text: "ما التعريف الأصح للخوارزمية؟",
    options: ["قائمة عشوائية من الأوامر", "سلسلة خطوات محدودة ومرتّبة لحل مسألة ما", "لغة من لغات البرمجة", "جهاز من مكونات الحاسوب"],
    correct: [1],
    explain: "الخوارزمية خطوات واضحة ومحدودة ومرتّبة تحل مسألة في عدد منتهٍ من الخطوات.",
  },
  {
    id: "q2", topic: "الترميز", kind: "single", points: 3, hasAttempts: true,
    text: "حوّل العدد 13 من النظام العشري إلى النظام الثنائي:",
    options: ["1011", "1101", "1110", "1001"],
    correct: [1],
    explain: "العدد 13 = 8 + 4 + 1، إذن كتابته الثنائية هي 1101.",
  },
  {
    id: "q3", topic: "البرمجة", kind: "multi", points: 3, hasAttempts: true,
    text: "اختر لغات البرمجة من القائمة التالية:",
    options: ["Python", "HTML", "C++", "CSS"],
    correct: [0, 2],
    explain: "HTML لغة هيكلة وCSS لغة تنسيق، أما Python وC++ فلغتا برمجة.",
  },
  {
    id: "q4", topic: "مخططات الانسياب", kind: "single", points: 2, hasAttempts: true,
    text: "في مخطط الانسياب، ماذا يمثّل شكل المستطيل؟",
    options: ["عملية / معالجة", "قرار", "بداية أو نهاية", "إدخال / إخراج"],
    correct: [0],
    explain: "المستطيل يمثّل عملية معالجة، بينما يمثّل المعيّن قرارًا والشكل البيضاوي بداية أو نهاية.",
  },
  {
    id: "q5", topic: "عتاد الحاسوب", kind: "multi", points: 3, hasAttempts: true,
    text: "أي الأجهزة التالية تُعد أجهزة إدخال؟",
    options: ["لوحة المفاتيح", "الطابعة", "الفأرة", "مكبّر الصوت"],
    correct: [0, 2],
    explain: "لوحة المفاتيح والفأرة يدخِلان البيانات، بينما الطابعة والمكبّر أجهزة إخراج.",
  },
  {
    id: "q6", topic: "البرمجة", kind: "single", points: 2, hasAttempts: false,
    text: "ما بنية التكرار التي تنفّذ الأوامر أولًا ثم تفحص الشرط؟",
    options: ["التكرار بشرط لاحق (do…while)", "الجملة الشرطية if", "الاختيار المتعدد switch", "التسلسل البسيط"],
    correct: [0],
    explain: "do…while تنفّذ جسم الحلقة قبل فحص الشرط، لذا تنفذ مرة واحدة على الأقل.",
  },
  {
    id: "q7", topic: "عتاد الحاسوب", kind: "single", points: 2, hasAttempts: false,
    text: "وحدة قياس تردد المعالج هي:",
    options: ["الغيغاهرتز GHz", "البايت Byte", "البكسل Pixel", "الواط Watt"],
    correct: [0],
    explain: "يقاس تردد المعالج بالهرتز ومضاعفاته مثل الغيغاهرتز.",
  },
  {
    id: "q8", topic: "الأمن الرقمي", kind: "multi", points: 3, hasAttempts: false,
    text: "أي الممارسات التالية تحمي حسابك الرقمي؟",
    options: ["كلمة مرور قوية وفريدة", "مشاركة كلمة المرور مع الأصدقاء", "تفعيل التحقق بخطوتين", "الضغط على أي رابط يصلك"],
    correct: [0, 2],
    explain: "كلمة المرور القوية والتحقق بخطوتين ممارستان أساسيتان للحماية.",
  },
  {
    id: "b1", topic: "بايثون", kind: "single", points: 2, hasAttempts: false,
    text: "أي رمز يُستخدم لكتابة تعليق في لغة بايثون؟",
    options: ["#", "//", "<!--", "**"],
    correct: [0],
    explain: "التعليقات في بايثون تبدأ بالرمز #.",
  },
  {
    id: "b2", topic: "أنظمة التشغيل", kind: "multi", points: 3, hasAttempts: false,
    text: "من أنظمة التشغيل:",
    options: ["Windows", "Linux", "Photoshop", "Android"],
    correct: [0, 1, 3],
    explain: "Photoshop برنامج لتحرير الصور وليس نظام تشغيل.",
  },
  {
    id: "b3", topic: "الترميز", kind: "single", points: 2, hasAttempts: false,
    text: "الكيلوبايت الواحد يساوي:",
    options: ["1024 بايت", "100 بايت", "10000 بايت", "8 بايت"],
    correct: [0],
    explain: "الكيلوبايت = 2^10 = 1024 بايت.",
  },
  {
    id: "b4", topic: "الشبكات", kind: "single", points: 2, hasAttempts: false,
    text: "البروتوكول المسؤول عن نقل صفحات الويب هو:",
    options: ["HTTP", "FTP", "SMTP", "POP3"],
    correct: [0],
    explain: "HTTP بروتوكول نقل النصوص التشعبية المستخدم في الويب.",
  },
];

export const qById = (id: string) => QUESTIONS.find((q) => q.id === id)!;

/* ============ الامتحانات ============ */

export const EXAMS: Exam[] = [
  {
    id: "ex1",
    title: "فرض إلكتروني: الخوارزميات ومخططات الانسياب",
    desc: "فرض يغطي مفاهيم الخوارزميات، الترميز الثنائي، مخططات الانسياب وأساسيات الأمن الرقمي.",
    type: "فرض إلكتروني",
    level: "الثالثة إعدادي",
    durationMin: 12,
    start: daysFromNow(-1, 8),
    end: daysFromNow(5, 20),
    status: "available",
    questions: QUESTIONS.slice(0, 8),
    attemptsAllowed: 1,
    passPct: 50,
    resultPolicy: "immediate",
    showCorrection: true,
  },
  {
    id: "ex2",
    title: "فرض مرحلي: أساسيات بايثون",
    desc: "فرض مرحلي حول المتغيرات، أنواع البيانات والجمل الشرطية في لغة بايثون.",
    type: "مرحلي",
    level: "الثالثة إعدادي",
    durationMin: 20,
    start: daysFromNow(2, 9),
    end: daysFromNow(4, 18),
    status: "upcoming",
    questions: QUESTIONS.filter((q) => ["b1", "b3", "q3"].includes(q.id)),
    attemptsAllowed: 1,
    passPct: 50,
    resultPolicy: "immediate",
    showCorrection: true,
  },
  {
    id: "ex3",
    title: "الامتحان التشخيصي: مدخل إلى المعلوماتية",
    desc: "امتحان تشخيصي لبداية الأسدس لتقييم المكتسبات الأساسية.",
    type: "تشخيصي",
    level: "الثالثة إعدادي",
    durationMin: 15,
    start: daysFromNow(-10, 8),
    end: daysFromNow(-8, 18),
    status: "completed",
    questions: QUESTIONS.slice(0, 8),
    attemptsAllowed: 1,
    passPct: 50,
    resultPolicy: "immediate",
    showCorrection: true,
    storedResult: {
      score: 16,
      total: 20,
      finishedAt: daysFromNow(-8, 10, 24),
      answers: { q1: [1], q2: [1], q3: [0, 2], q4: [0], q5: [0, 2], q6: [1], q7: [1], q8: [0, 2] },
    },
  },
  {
    id: "ex4",
    title: "فرض الفصل الأول: العتاد والبرمجيات",
    desc: "فرض شامل حول مكونات الحاسوب وأنظمة التشغيل.",
    type: "مرحلي",
    level: "الثالثة إعدادي",
    durationMin: 25,
    start: daysFromNow(-20, 8),
    end: daysFromNow(-18, 18),
    status: "completed",
    questions: QUESTIONS.filter((q) => ["b2", "b3", "q5", "q7"].includes(q.id)),
    attemptsAllowed: 1,
    passPct: 50,
    resultPolicy: "manual",
    showCorrection: false,
  },
  {
    id: "ex5",
    title: "اختبار سريع: الشبكات المحلية",
    desc: "اختبار قصير حول مفاهيم الشبكات المحلية وعناوين IP.",
    type: "تشخيصي",
    level: "الثالثة إعدادي",
    durationMin: 10,
    start: daysFromNow(-30, 8),
    end: daysFromNow(-29, 12),
    status: "ended",
    questions: QUESTIONS.filter((q) => ["b4", "b2"].includes(q.id)),
    attemptsAllowed: 1,
    passPct: 50,
    resultPolicy: "immediate",
    showCorrection: false,
  },
  {
    id: "ex6",
    title: "فرض إلكتروني: قواعد البيانات (مسودة)",
    desc: "مسودة فرض حول الجداول والاستعلامات البسيطة.",
    type: "فرض إلكتروني",
    level: "الثالثة إعدادي",
    durationMin: 30,
    start: daysFromNow(7, 8),
    end: daysFromNow(9, 18),
    status: "draft",
    questions: QUESTIONS.slice(0, 5),
    attemptsAllowed: 2,
    passPct: 60,
    resultPolicy: "afterEnd",
    showCorrection: true,
  },
];

/* ============ المقالات ============ */

export const ARTICLES: Article[] = [
  {
    id: "a1",
    title: "النظام الثنائي ببساطة: كيف يفكر الحاسوب؟",
    summary: "لماذا يفهم الحاسوب الصفر والواحد فقط؟ رحلة مبسطة داخل النظام الثنائي مع أمثلة وتمارين تفاعلية.",
    cover: COVERS.binary,
    author: { name: "أمينة ب.", level: "الثالثة إعدادي" },
    date: daysFromNow(-6, 15),
    readMin: 6,
    status: "published",
    tags: ["الترميز", "أساسيات"],
    owner: true,
    body: [
      "في قلب كل حاسوب، مهما بلغت قوته، لا يوجد سوى مفتاحين: مفتاح يمرر التيار ومفتاح لا يمرره. من هاتين الحالتين وُلد النظام الثنائي، اللغة الأم التي تفهم بها الآلات كل شيء: النصوص، الصور، الأصوات والفيديوهات.",
      "يعتمد النظام الثنائي على رمزين فقط هما 0 و1. كل خانة في عدد ثنائي تسمى «بت» (Bit)، وكل 8 بتات تشكل «بايت» (Byte) واحدًا قادرًا على تمثيل 256 قيمة مختلفة — وهو ما يكفي لتمثيل حرف واحد من نص.",
      "لتحويل عدد عشري إلى ثنائي نقسمه على 2 بشكل متكرر وندوّن البواقي. مثلًا العدد 13: نقسمه على 2 فنحصل على باقي 1، ثم 0، ثم 1، وأخيرًا 1 — وبقلب البواقي نقرأ النتيجة.",
      "جرّب بنفسك: حوّل عمرك إلى النظام الثنائي، ثم قارنه مع زميلك. ستكتشف أن الأعداد التي تبدو معقدة ما هي إلا متتالية بسيطة من القرارات: نعم (1) أو لا (0).",
      "في الدرس القادم سنرى كيف تُخزَّن الصور باستخدام البتات فقط، وكيف تتحول ملايين المصابيح الصغيرة المطفأة والمضيئة إلى صورة ملونة على شاشتك.",
    ],
    code: {
      lang: "python",
      text: "# تحويل العدد 13 إلى النظام الثنائي\nnumber = 13\nresult = bin(number)\nprint(result)  # 0b1101\n\n# 13 = 8 + 4 + 1\n#      ↓   ↓   ↓\n#      1   1   0   1",
    },
  },
  {
    id: "a2",
    title: "كيف تحمي بياناتك الرقمية: دليل التلميذ",
    summary: "كلمات المرور القوية، التحقق بخطوتين، والحذر من الروابط المشبوهة — عادات بسيطة تصنع درعًا رقميًا متينًا.",
    cover: COVERS.network,
    author: { name: "نور الصقلي", level: "الثانية إعدادي" },
    date: daysFromNow(-9, 11),
    readMin: 5,
    status: "published",
    tags: ["الأمن الرقمي"],
    body: [
      "تخيل أن حساباتك الرقمية غرف في بيتك: كلمة المرور هي المفتاح، والتحقق بخطوتين هو القفل الإضافي على الباب. كلما زادت أقفالك، صعب على الغرباء الدخول.",
      "القاعدة الذهبية لكلمة المرور: طويلة (12 رمزًا على الأقل)، مزيج من حروف وأرقام ورموز، وفريدة لكل حساب. لا تكتب «123456» ولا اسمك مع سنة ميلادك — فهذه أول ما يجربه المخترقون.",
      "احذر الروابط التي تصلك في رسائل غريبة حتى لو بدا مرسلها صديقًا، فالحسابات تُخترق وتُستخدم لإرسال فخاخ. تحقق دائمًا قبل الضغط.",
    ],
  },
  {
    id: "a3",
    title: "مخططات الانسياب: ارسم منطقك قبل أن تبرمجه",
    summary: "الأشكال الخمسة الأساسية في مخططات الانسياب وكيف تساعدك على التفكير كمبرمج قبل كتابة أي سطر كود.",
    cover: COVERS.python,
    author: { name: "ياسين إ.", level: "الثالثة إعدادي" },
    date: daysFromNow(-13, 16),
    readMin: 7,
    status: "published",
    tags: ["الخوارزميات"],
    body: [
      "قبل أن يبني المهندس عمارة يرسم مخططًا، وقبل أن تكتب برنامجًا ناجحًا ارسم مخطط انسياب. هو تمثيل مرئي لخطوات الحل: بيضاوي للبداية والنهاية، مستطيل للمعالجة، معيّن للقرار، ومتوازي أضلاع للإدخال والإخراج.",
      "الميزة الكبرى؟ الأخطاء تظهر على الورق قبل أن تكلفك ساعات من التصحيح في الكود. جرّب رسم مخطط لقرار بسيط: «هل معدلّي أكبر من 10؟» ثم أضف فرعين: نجاح أو استدراك.",
    ],
  },
  {
    id: "a4",
    title: "أساسيات بايثون للمتعلمين الجدد",
    summary: "أول خطواتك مع لغة بايثون: المتغيرات، الطباعة، والجمل الشرطية بأمثلة من الحياة المدرسية.",
    cover: COVERS.python,
    author: { name: "أمينة ب.", level: "الثالثة إعدادي" },
    date: daysFromNow(-1, 10),
    readMin: 8,
    status: "review",
    tags: ["البرمجة", "بايثون"],
    owner: true,
    body: [
      "بايثون لغة قريبة من اللغة الإنجليزية، لذلك يختارها معظم المبتدئين حول العالم. في هذا المقال سنتعرف على المتغيرات وطريقة الطباعة والجمل الشرطية.",
      "المقال ما يزال قيد مراجعة الأستاذ قبل النشر في الواجهة العامة.",
    ],
  },
  {
    id: "a5",
    title: "الشبكات والإنترنت: ما الذي يحدث عندما تفتح صفحة؟",
    summary: "رحلة طلبك من هاتفك إلى الخادم والعودة: DNS وHTTP والخوادم في شرح مبسط بالرسوم.",
    author: { name: "أمينة ب.", level: "الثالثة إعدادي" },
    date: daysFromNow(-3, 14),
    readMin: 6,
    status: "changes",
    tags: ["الشبكات"],
    owner: true,
    note: "الفكرة ممتازة، لكن أضيفي فقرة عن الفرق بين الإنترنت والويب، وراجعي المصطلحات في الفقرة الثانية. أرفقي مخططًا توضيحيًا إن أمكن.",
    body: ["مسودة تحتاج إلى التعديل وفق ملاحظات الأستاذ."],
  },
  {
    id: "a6",
    title: "تاريخ الحواسيب في صفحة واحدة",
    summary: "من الآلات الميكانيكية إلى الحواسيب الكمية: أهم المحطات التي صنعت الثورة الرقمية.",
    author: { name: "أمينة ب.", level: "الثالثة إعدادي" },
    date: daysFromNow(-16, 9),
    readMin: 4,
    status: "rejected",
    tags: ["ثقافة رقمية"],
    owner: true,
    note: "المقال منقول تقريبًا حرفيًا من المصدر دون إعادة صياغة أو إضافة رأي شخصي. أعد كتابته بأسلوبك الخاص مع توثيق المصادر.",
    body: ["المقال مرفوض حاليًا — يمكن تعديله وإعادة إرساله."],
  },
  {
    id: "a7",
    title: "مقدمة إلى الذكاء الاصطناعي: أسئلة وأجوبة",
    summary: "ما الذكاء الاصطناعي فعلًا؟ وما الفرق بينه وبين البرمجة التقليدية؟ إجابات مبسطة بأمثلة مألوفة.",
    author: { name: "أمينة ب.", level: "الثالثة إعدادي" },
    date: hoursAgo(5),
    readMin: 5,
    status: "draft",
    tags: ["الذكاء الاصطناعي"],
    owner: true,
    body: ["مسودة لم تُرسل بعد للمراجعة."],
  },
  {
    id: "a8",
    title: "الأمن السيبراني في حياتنا اليومية",
    summary: "كيف نحمي هواتفنا وبياناتنا من الاختراق؟ عادات رقمية آمنة لكل تلميذ.",
    author: { name: "نور ص.", level: "الثانية إعدادي" },
    date: hoursAgo(30),
    readMin: 5,
    status: "review",
    tags: ["الأمن الرقمي"],
    body: ["بانتظار مراجعة الأستاذ."],
  },
];

/* ============ المشاريع ============ */

export const PROJECTS: Project[] = [
  {
    id: "p1",
    title: "روبوت الفرز الذكي",
    summary: "روبوت تعليمي يفرز المكعبات حسب اللون باستخدام مستشعر ألوان، بُرمج بلغة سكراتش ثم بايثون.",
    cover: COVERS.robot,
    members: [
      { name: "أمينة ب.", role: "برمجة" },
      { name: "ياسين إ.", role: "تجميع" },
      { name: "سلمى أ.", role: "توثيق" },
    ],
    date: daysFromNow(-4, 17),
    kind: "جماعي",
    level: "الثالثة إعدادي",
    status: "published",
    tech: ["Python", "Arduino", "Scratch"],
    link: { url: "https://example.com/robot", label: "فيديو العرض", verified: true },
    owner: true,
    body: [
      "بدأت الفكرة من درس المستشعرات: هل يستطيع الحاسوب «رؤية» الألوان؟ بنينا روبوتًا صغيرًا بعجلات ومحرك ذراع، وعلّمناه قراءة قيمة المستشعر ومقارنتها بجدول الألوان.",
      "أصعب جزء كان معايرة المستشعر مع الإضاءة المختلفة للمختبر، وحللنا المشكلة بزر معايرة يدوي. المشروع حاز على المرتبة الأولى في معرض النادي العلمي.",
    ],
  },
  {
    id: "p2",
    title: "تطبيق جدول الحصص",
    summary: "تطبيق ويب بسيط يعرض جدول الحصص اليومي مع تنبيه قبل كل حصة، مبني بأدوات الويب الأساسية.",
    cover: COVERS.app,
    members: [{ name: "أمينة ب.", role: "تصميم وبرمجة" }],
    date: daysFromNow(-11, 12),
    kind: "فردي",
    level: "الثالثة إعدادي",
    status: "published",
    tech: ["HTML", "CSS", "JavaScript"],
    link: { url: "https://example.com/schedule", label: "تجربة التطبيق", verified: false },
    owner: true,
    body: [
      "تطبيق خفيف يحفظ جدول القسم في ملف JSON ويعرض حصة اليوم تلقائيًا، مع إشعار قبل الحصة بعشر دقائق.",
    ],
  },
  {
    id: "p3",
    title: "لعبة متاهة الحروف البرمجية",
    summary: "لعبة تعليمية تقود فيها روبوتًا داخل متاهة باستخدام أوامر برمجية لتجميع الحروف وتكوين كلمات.",
    cover: COVERS.game,
    members: [
      { name: "أمينة ب.", role: "فكرة ومنطق" },
      { name: "عمر ت.", role: "رسوم" },
    ],
    date: daysFromNow(-2, 18),
    kind: "جماعي",
    level: "الثالثة إعدادي",
    status: "review",
    tech: ["Scratch"],
    owner: true,
    body: ["اللعبة قيد مراجعة الأستاذ قبل النشر."],
  },
  {
    id: "p4",
    title: "موقع النادي العلمي",
    summary: "موقع تعريفي بالنادي العلمي للمؤسسة: الأنشطة، الأعضاء، ومعرض المشاريع.",
    cover: COVERS.binary,
    members: [{ name: "أمينة ب.", role: "تطوير" }],
    date: daysFromNow(-7, 10),
    kind: "فردي",
    level: "الثالثة إعدادي",
    status: "changes",
    tech: ["HTML", "CSS"],
    owner: true,
    note: "الموقع جيد عمومًا. حسّني التجاوب مع الهاتف وأضيفي نصًا بديلًا للصور قبل إعادة الإرسال.",
    body: ["بحاجة إلى تعديلات حسب ملاحظة الأستاذ."],
  },
  {
    id: "p5",
    title: "مكتبة القسم الرقمية",
    summary: "قاعدة بيانات بسيطة لتنظيم كتب خزانة القسم مع بحث سريع وإحصاءات الإعارة.",
    cover: COVERS.network,
    members: [
      { name: "رضا ب.", role: "قاعدة البيانات" },
      { name: "مريم ح.", role: "الواجهة" },
    ],
    date: hoursAgo(40),
    kind: "جماعي",
    level: "الثانية إعدادي",
    status: "review",
    tech: ["SQL", "HTML"],
    body: ["بانتظار المراجعة."],
  },
];

/* ============ التلاميذ (لوحة الأستاذ) ============ */

export const STUDENTS: StudentRow[] = [
  { id: "s1", name: "أمينة بنعلي", username: "amina.benali", level: "الثالثة إعدادي", group: "أ", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(2), avg: 16.2 },
  { id: "s2", name: "ياسين الإدريسي", username: "yassine.idrissi", level: "الثالثة إعدادي", group: "أ", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(6), avg: 14.8 },
  { id: "s3", name: "سلمى أمرابط", username: "salma.amrabat", level: "الثالثة إعدادي", group: "ب", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(20), avg: 17.5 },
  { id: "s4", name: "عمر تازي", username: "omar.tazi", level: "الثالثة إعدادي", group: "أ", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(30), avg: 12.4 },
  { id: "s5", name: "خديجة العلوي", username: "khadija.aloui", level: "الثالثة إعدادي", group: "ب", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(50), avg: 15.1 },
  { id: "s6", name: "رضا بناني", username: "reda.bennani", level: "الثانية إعدادي", group: "أ", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(70), avg: 13.7 },
  { id: "s7", name: "مريم الحسني", username: "meryem.hassani", level: "الثانية إعدادي", group: "أ", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(90), avg: 18.1 },
  { id: "s8", name: "آدم الفاسي", username: "adam.fassi", level: "الثانية إعدادي", group: "ب", status: "suspended", hasLoggedIn: true, lastLogin: hoursAgo(200), avg: 9.3 },
  { id: "s9", name: "نور الصقلي", username: "nour.sekkali", level: "الثانية إعدادي", group: "ب", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(8), avg: 15.9 },
  { id: "s10", name: "يوسف الناصري", username: "youssef.nasri", level: "الثانية إعدادي", group: "أ", status: "active", hasLoggedIn: false, lastLogin: null, avg: null },
  { id: "s11", name: "لينا برادة", username: "lina.berrada", level: "الأولى إعدادي", group: "أ", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(120), avg: 14.2 },
  { id: "s12", name: "مهدي السباعي", username: "mehdi.sbai", level: "الأولى إعدادي", group: "أ", status: "active", hasLoggedIn: false, lastLogin: null, avg: null },
  { id: "s13", name: "زينب قاسمي", username: "zineb.kacimi", level: "الأولى إعدادي", group: "ب", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(10), avg: 16.8 },
  { id: "s14", name: "أيمن مرابط", username: "ayman.mrabet", level: "الأولى إعدادي", group: "ب", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(140), avg: 11.5 },
  { id: "s15", name: "سارة بنجلون", username: "sara.benjelloun", level: "الثالثة إعدادي", group: "ب", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(4), avg: 17.9 },
  { id: "s16", name: "حمزة الريفي", username: "hamza.rifi", level: "الثالثة إعدادي", group: "أ", status: "archived", hasLoggedIn: true, lastLogin: hoursAgo(2000), avg: 10.2 },
  { id: "s17", name: "جمانة أيت الحاج", username: "joumana.aitlhaj", level: "الأولى إعدادي", group: "أ", status: "active", hasLoggedIn: true, lastLogin: hoursAgo(16), avg: 15.4 },
  { id: "s18", name: "وليد بوعمري", username: "walid.bouamri", level: "الثانية إعدادي", group: "ب", status: "active", hasLoggedIn: false, lastLogin: null, avg: null },
];

/* ============ الإشعارات (التلميذ) ============ */

export const NOTIFS: Notif[] = [
  { id: "n1", type: "exam", title: "امتحان جديد متاح", desc: "«فرض إلكتروني: الخوارزميات ومخططات الانسياب» أصبح متاحًا الآن — مدته 12 دقيقة.", time: hoursAgo(2), unread: true },
  { id: "n2", type: "result", title: "نتيجتك جاهزة", desc: "حصلتِ على 16/20 في الامتحان التشخيصي. عمل رائع!", time: hoursAgo(26), unread: true },
  { id: "n3", type: "edit", title: "طلب تعديل على مقال", desc: "طلب الأستاذ تعديل مقال «الشبكات والإنترنت» وأرفق ملاحظات قيّمة.", time: hoursAgo(50), unread: true },
  { id: "n4", type: "publish", title: "مبروك! نُشر مشروعك", desc: "«روبوت الفرز الذكي» أصبح معروضًا في الواجهة العامة للزوار.", time: daysFromNow(-4, 17), unread: false },
  { id: "n5", type: "info", title: "تحديث جدول الامتحانات", desc: "أُضيف فرض مرحلي جديد لأساسيات بايثون سيُفتح بعد يومين.", time: daysFromNow(-1, 9), unread: false },
];

/* ============ نشاطات لوحة الأستاذ ============ */

export const ACTIVITY: { icon: string; text: string; time: string }[] = [
  { icon: "login", text: "سجّلت سارة بنجلون الدخول لأول مرة", time: hoursAgo(4) },
  { icon: "submit", text: "أرسلت أمينة بنعلي مقال «أساسيات بايثون» للمراجعة", time: hoursAgo(30) },
  { icon: "submit", text: "أرسل رضا بناني مشروع «مكتبة القسم الرقمية» للمراجعة", time: hoursAgo(40) },
  { icon: "exam", text: "بدأ 23 تلميذًا الفرض الإلكتروني: الخوارزميات", time: hoursAgo(48) },
  { icon: "approve", text: "نشرتَ مشروع «روبوت الفرز الذكي» في الواجهة العامة", time: daysFromNow(-4, 17) },
  { icon: "reset", text: "أعدت تعيين كلمة مرور التلميذ آدم الفاسي", time: daysFromNow(-5, 11) },
  { icon: "exam", text: "انتهى الامتحان التشخيصي — النتائج متاحة للتلاميذ", time: daysFromNow(-8, 18) },
  { icon: "import", text: "استوردت 15 تلميذًا من ملف Excel بنجاح", time: daysFromNow(-12, 10) },
];

/* ============ طابور المراجعة ============ */

export interface ReviewItem {
  id: string;
  kind: "مقال" | "مشروع";
  title: string;
  author: string;
  level: string;
  submittedAt: string;
  status: "review";
  summary: string;
  body: string[];
  history: { action: string; at: string }[];
}

export const REVIEW_QUEUE: ReviewItem[] = [
  {
    id: "r1", kind: "مقال", title: "أساسيات بايثون للمتعلمين الجدد", author: "أمينة بنعلي", level: "الثالثة إعدادي — أ",
    submittedAt: hoursAgo(30), status: "review",
    summary: "أول خطواتك مع لغة بايثون: المتغيرات، الطباعة، والجمل الشرطية بأمثلة من الحياة المدرسية.",
    body: [
      "بايثون لغة قريبة من اللغة الإنجليزية، لذلك يختارها معظم المبتدئين حول العالم. في هذا المقال سنتعرف على المتغيرات وطريقة الطباعة والجمل الشرطية.",
      "المتغير يشبه صندوقًا تكتب عليه اسمًا وتضع بداخله قيمة: name = «أمينة». وبعدها يمكنك استعمال الاسم في أي مكان بدل القيمة.",
      "الجمل الشرطية تسمح للبرنامج باتخاذ قرار: إذا كان المعدل أكبر من 10 اطبع «ناجح»، وإلا اطبع «استدراك».",
    ],
    history: [
      { action: "أنشأت التلميذة المقال كمسودة", at: daysFromNow(-3, 9) },
      { action: "أُرسل للمراجعة", at: hoursAgo(30) },
    ],
  },
  {
    id: "r2", kind: "مشروع", title: "لعبة متاهة الحروف البرمجية", author: "أمينة بنعلي + عمر تازي", level: "الثالثة إعدادي — أ",
    submittedAt: hoursAgo(20), status: "review",
    summary: "لعبة تعليمية تقود فيها روبوتًا داخل متاهة باستخدام أوامر برمجية لتجميع الحروف وتكوين كلمات.",
    body: [
      "اللعبة مبنية بلغة سكراتش: يختار التلميذ تسلسل أوامر (تقدم، انعطف، التقط) لقيادة الروبوت داخل المتاهة.",
      "تضم اللعبة 12 مستوى متدرج الصعوبة، وكل مستوى يعلّم مفهومًا: التسلسل، التكرار، ثم الشرط.",
    ],
    history: [
      { action: "أُنشئ المشروع (عمل جماعي)", at: daysFromNow(-6, 14) },
      { action: "أُرسل للمراجعة", at: hoursAgo(20) },
    ],
  },
  {
    id: "r3", kind: "مقال", title: "الأمن السيبراني في حياتنا اليومية", author: "نور الصقلي", level: "الثانية إعدادي — ب",
    submittedAt: hoursAgo(32), status: "review",
    summary: "كيف نحمي هواتفنا وبياناتنا من الاختراق؟ عادات رقمية آمنة لكل تلميذ.",
    body: [
      "نتصل بالإنترنت يوميًا من هواتفنا، وكل اتصال يترك أثرًا. في هذا المقال نستعرض عادات بسيطة تحمي بياناتنا.",
      "أولها تحديث التطبيقات باستمرار، فالتحديثات تسد ثغرات أمنية حقيقية اكتشفها الباحثون.",
    ],
    history: [{ action: "أُرسل للمراجعة", at: hoursAgo(32) }],
  },
  {
    id: "r4", kind: "مشروع", title: "مكتبة القسم الرقمية", author: "رضا بناني + مريم الحسني", level: "الثانية إعدادي — أ",
    submittedAt: hoursAgo(40), status: "review",
    summary: "قاعدة بيانات بسيطة لتنظيم كتب خزانة القسم مع بحث سريع وإحصاءات الإعارة.",
    body: [
      "صممنا جدولًا للكتب بواجهة بحث فورية، وسجلًا للإعارات يعيد تنبيه التلميذ عند تأخر الإرجاع.",
    ],
    history: [{ action: "أُرسل للمراجعة", at: hoursAgo(40) }],
  },
];

/* ============ إحصائيات ============ */

export const KPI = {
  students: 132,
  loggedInOnce: 118,
  active7: 64,
  active30: 97,
  visits30: 1840,
  unique30: 412,
  publishedExams: 46,
  endedExams: 31,
  avgScore: 71.4,
  completionRate: 86,
  successRate: 78,
  pendingContent: 4,
};

export const LOGINS_14D = [8, 12, 9, 15, 22, 18, 11, 7, 16, 25, 21, 14, 19, 23];
export const VISITS_30D = [
  42, 55, 48, 61, 70, 58, 39, 35, 52, 66, 74, 69, 58, 47, 63, 81, 92, 77, 65, 58,
  72, 88, 95, 84, 70, 62, 78, 90, 101, 96,
];
export const GRADE_DIST = [
  { label: "أقل من 50%", value: 14, color: "#e11d48" },
  { label: "50% – 69%", value: 24, color: "#f2a93b" },
  { label: "70% – 84%", value: 38, color: "#4353c4" },
  { label: "85% فأكثر", value: 24, color: "#059669" },
];
export const PER_QUESTION = [
  { label: "س1 — تعريف الخوارزمية", correct: 82, wrong: 18 },
  { label: "س2 — التحويل الثنائي", correct: 64, wrong: 36 },
  { label: "س3 — لغات البرمجة", correct: 58, wrong: 42 },
  { label: "س4 — مخطط الانسياب", correct: 76, wrong: 24 },
  { label: "س5 — أجهزة الإدخال", correct: 88, wrong: 12 },
  { label: "س6 — بنية التكرار", correct: 51, wrong: 49 },
  { label: "س7 — تردد المعالج", correct: 69, wrong: 31 },
  { label: "س8 — الأمن الرقمي", correct: 91, wrong: 9 },
];
export const TOP_PAGES = [
  { page: "الصفحة الرئيسية", views: 640 },
  { page: "قائمة المقالات", views: 312 },
  { page: "قائمة المشاريع", views: 276 },
  { page: "تسجيل دخول التلاميذ", views: 194 },
  { page: "مقال: النظام الثنائي ببساطة", views: 128 },
];

/* ============ استيراد التلاميذ ============ */

export interface ImportRow {
  row: number;
  name: string;
  username: string;
  level: string;
  group: string;
  error?: string;
}

export const IMPORT_ROWS: ImportRow[] = [
  { row: 2, name: "أنس الحمداوي", username: "anas.hamdaoui", level: "الأولى إعدادي", group: "ب" },
  { row: 3, name: "هاجر أوبرا", username: "hajar.oubra", level: "الأولى إعدادي", group: "ب" },
  { row: 4, name: "عمر تازي", username: "omar.tazi", level: "الثالثة إعدادي", group: "أ", error: "اسم المستخدم مستعمل مسبقًا (صف مكرر)" },
  { row: 5, name: "إيمان بلقاسم", username: "imane.belkacem", level: "الثانية إعدادي", group: "أ" },
  { row: 6, name: "طه أزم", username: "taha.azam", level: "الثانية إعدادي", group: "ب" },
  { row: 7, name: "دعاء مرشد", username: "douae.mourchid", level: "الخامس ابتدائي", group: "أ", error: "مستوى غير موجود في المنصة" },
  { row: 8, name: "ريان بلعزيز", username: "rayan.belaaziz", level: "الأولى إعدادي", group: "أ" },
  { row: 9, name: "أسامة كروم", username: "ossama.karroum", level: "الثالثة إعدادي", group: "ب" },
  { row: 10, name: "شيماء تاغزة", username: "chaimae.taghza", level: "الثانية إعدادي", group: "أ" },
  { row: 11, name: "", username: "missing.name", level: "الأولى إعدادي", group: "ب", error: "الاسم الكامل فارغ" },
  { row: 12, name: "معاذ أيت العربي", username: "moaad.aitlarbi", level: "الثالثة إعدادي", group: "أ" },
  { row: 13, name: "غيثة بوسلهام", username: "ghita.bouslaham", level: "الثانية إعدادي", group: "ب" },
];

export const MARQUEE_TOPICS = [
  "الخوارزميات", "بايثون", "الشبكات", "قواعد البيانات", "تطوير الويب", "الروبوتيك",
  "الأمن السيبراني", "أنظمة التشغيل", "مخططات الانسياب", "الذكاء الاصطناعي",
];
