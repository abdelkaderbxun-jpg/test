import { useEffect } from "react";
import { HashRouter, Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth, useOnline } from "./core";
import { Btn, Modal, ToastProvider } from "./ui";
import { IcLock, IcShield, IcWifiOff } from "./icons";
import {
  ArticleDetailPage, ArticlesPage, HomePage, ProjectDetailPage, ProjectsPage, PublicLayout,
} from "./views/public";
import { StudentLogin, TeacherLogin } from "./views/login";
import {
  StudentArticlesRouter, StudentDashboard, StudentExamsPage, StudentLayout,
  StudentNotificationsPage, StudentProfilePage, StudentProjectsRouter,
} from "./views/student";
import { ExamPlayer, ExamResultPage } from "./views/exam";
import { ImportWizardPage, SlipsPage, StudentsPage, TeacherDashboard, TeacherLayout } from "./views/teacher-a";
import { ExamStatsPage, ExamsAdminPage, QuestionsPage, ReportsPage, ReviewPage } from "./views/teacher-b";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="no-print anim-fade-up fixed inset-x-0 top-0 z-[120] flex items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-center text-[13px] font-bold text-ink-900">
      <IcWifiOff size={16} /> انقطع الاتصال بالإنترنت — وضع الحفظ المحلي مفعّل، وستُزامَن بياناتك عند عودة الاتصال.
    </div>
  );
}

function SessionExpiredGate({ children }: { children: React.ReactNode }) {
  const { user, expired, acknowledgeExpired } = useAuth();
  const navigate = useNavigate();
  const goLogin = () => {
    const role = user?.role;
    acknowledgeExpired();
    navigate(role === "teacher" ? "/teacher/login" : "/login");
  };
  return (
    <>
      {children}
      <Modal open={expired} onClose={goLogin} title="انتهت الجلسة" footer={<Btn onClick={goLogin} icon={<IcLock size={16} />}>تسجيل الدخول مجددًا</Btn>}>
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-100 text-amber-600"><IcLock size={30} /></span>
          <p className="mt-4 leading-7 text-ink-600">
            لحماية حسابك، انتهت جلستك تلقائيًا بعد فترة من عدم النشاط.
            سجّل الدخول مجددًا للمتابعة — <strong>لن تفقد أي إجابات أو أعمال محفوظة</strong>.
          </p>
        </div>
      </Modal>
    </>
  );
}

function Guard({ role, children }: { role: "student" | "teacher"; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={role === "student" ? "/login" : "/teacher/login"} replace />;
  if (user.role !== role) return <Forbidden />;
  return <>{children}</>;
}

function Forbidden() {
  const { user, logout } = useAuth();
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4">
      <div className="anim-pop w-full max-w-lg rounded-2xl border border-ink-200 bg-white p-10 text-center shadow-xl shadow-ink-900/5">
        <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-rose-100 text-rose-600"><IcShield size={38} /></span>
        <p className="font-code mt-5 text-sm font-bold tracking-widest text-rose-500" dir="ltr">403 · FORBIDDEN</p>
        <h1 className="font-display mt-2 text-2xl font-extrabold text-ink-900">غير مصرّح بالوصول</h1>
        <p className="mt-3 leading-7 text-ink-500">
          حسابك الحالي ({user?.role === "student" ? "تلميذ" : "أستاذ"}) لا يملك صلاحية فتح هذه المنطقة.
          فصلُ الصلاحيات بين التلاميذ والأساتذة جزء أساسي من أمان المنصة.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={user?.role === "teacher" ? "/teacher" : "/student"} className="inline-flex h-11 items-center rounded-lg bg-primary-600 px-6 text-sm font-bold text-white transition-colors hover:bg-primary-700">
            {user?.role === "teacher" ? "لوحة الأستاذ" : "فضاء التلميذ"}
          </Link>
          <button onClick={logout} className="inline-flex h-11 items-center rounded-lg border border-ink-200 bg-white px-5 text-sm font-bold text-ink-600 transition-colors hover:border-primary-400 hover:text-primary-700">
            الدخول بحساب آخر
          </button>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-code text-6xl font-bold text-ink-200" dir="ltr">404</p>
        <h1 className="font-display mt-4 text-2xl font-extrabold text-ink-900">الصفحة غير موجودة</h1>
        <p className="mt-3 leading-7 text-ink-500">ربما تغيّر الرابط أو حُذفت الصفحة. جرّب العودة إلى الرئيسية أو تصفح أعمال التلاميذ.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex h-11 items-center rounded-lg bg-primary-600 px-6 text-sm font-bold text-white hover:bg-primary-700">الرئيسية</Link>
          <Link to="/projects" className="inline-flex h-11 items-center rounded-lg border border-ink-200 bg-white px-5 text-sm font-bold text-ink-600 hover:border-primary-400 hover:text-primary-700">معرض المشاريع</Link>
        </div>
      </div>
    </PublicLayout>
  );
}

function LoginRedirect({ role }: { role: "student" | "teacher" }) {
  const { user } = useAuth();
  if (user?.role === role) return <Navigate to={role === "student" ? "/student" : "/teacher"} replace />;
  return role === "student" ? <StudentLogin /> : <TeacherLogin />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
          <ScrollToTop />
          <div className="noise-layer no-print" aria-hidden />
          <OfflineBanner />
          <SessionExpiredGate>
            <Routes>
              {/* الواجهة العامة */}
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/articles" element={<PublicLayout><ArticlesPage /></PublicLayout>} />
              <Route path="/articles/:id" element={<PublicLayout><ArticleDetailPage /></PublicLayout>} />
              <Route path="/projects" element={<PublicLayout><ProjectsPage /></PublicLayout>} />
              <Route path="/projects/:id" element={<PublicLayout><ProjectDetailPage /></PublicLayout>} />
              <Route path="/login" element={<LoginRedirect role="student" />} />
              <Route path="/teacher/login" element={<LoginRedirect role="teacher" />} />

              {/* شاشة الامتحان — بدون تخطيط التلميذ */}
              <Route path="/student/exams/:id/take" element={<Guard role="student"><ExamPlayer /></Guard>} />

              {/* فضاء التلميذ */}
              <Route path="/student" element={<Guard role="student"><StudentLayout><Outlet /></StudentLayout></Guard>}>
                <Route index element={<StudentDashboard />} />
                <Route path="exams" element={<StudentExamsPage />} />
                <Route path="exams/:id/result" element={<ExamResultPage />} />
                <Route path="articles" element={<StudentArticlesRouter />} />
                <Route path="articles/:id" element={<StudentArticlesRouter />} />
                <Route path="projects" element={<StudentProjectsRouter />} />
                <Route path="projects/:id" element={<StudentProjectsRouter />} />
                <Route path="notifications" element={<StudentNotificationsPage />} />
                <Route path="profile" element={<StudentProfilePage />} />
              </Route>

              {/* لوحة الأستاذ */}
              <Route path="/teacher" element={<Guard role="teacher"><TeacherLayout><Outlet /></TeacherLayout></Guard>}>
                <Route index element={<TeacherDashboard />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="import" element={<ImportWizardPage />} />
                <Route path="slips" element={<SlipsPage />} />
                <Route path="exams" element={<ExamsAdminPage />} />
                <Route path="exams/:id/stats" element={<ExamStatsPage />} />
                <Route path="questions" element={<QuestionsPage />} />
                <Route path="review" element={<ReviewPage />} />
                <Route path="reports" element={<ReportsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </SessionExpiredGate>
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
