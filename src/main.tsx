import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

/* حاجز أخطاء عام: يمنع الشاشة البيضاء ويعرض الخطأ بوضوح */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("خطأ في العرض:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div dir="rtl" style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", display: "grid", placeItems: "center", background: "#f2f5fb", padding: 16 }}>
          <div style={{ maxWidth: 560, width: "100%", background: "#fff", border: "1px solid #ccd5ec", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0a1633", marginTop: 8 }}>حدث خطأ غير متوقع في العرض</h1>
            <p style={{ color: "#4a5f9e", lineHeight: 1.9, marginTop: 8 }}>
              المنصة بخير، لكن عرض هذه الشاشة تعثّر. التفاصيل التقنية أدناه — أعد تحميل الصفحة للمتابعة.
            </p>
            <pre dir="ltr" style={{ textAlign: "left", background: "#0a1633", color: "#7de3f6", borderRadius: 10, padding: 14, fontSize: 12, overflowX: "auto", marginTop: 16 }}>
              {String(this.state.error?.message ?? this.state.error)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 20, height: 44, padding: "0 28px", borderRadius: 10, border: "none", background: "#4353c4", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

/* إشعار شبكة الأمان في index.html بأن التطبيق انطلق بنجاح */
(window as unknown as { __APP_MOUNTED__?: boolean }).__APP_MOUNTED__ = true;
