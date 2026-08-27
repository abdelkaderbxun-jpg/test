import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function svgProps(p: P) {
  const { size = 20, ...rest } = p;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
}

export const IcHome = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M3.5 10.4 12 3.5l8.5 6.9" />
    <path d="M5.5 9.5V20a1 1 0 0 0 1 1H9.8v-5.4h4.4V21h3.3a1 1 0 0 0 1-1V9.5" />
  </svg>
);
export const IcDoc = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M14 3v4h4" />
    <path d="M9.5 12h5M9.5 15.5h5" />
  </svg>
);
export const IcProject = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M3.5 8a2 2 0 0 1 2-2h3.6l2 2.4h7.4a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
    <path d="M10 14.2l2-2 2 2M12 12.5V17" />
  </svg>
);
export const IcExam = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 2.8h6v3H9z" />
    <path d="M9 12l1.8 1.8L14.5 10" />
    <path d="M9 17h6" />
  </svg>
);
export const IcClock = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const IcCalendar = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="4" y="5.5" width="16" height="15" rx="2" />
    <path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5" />
  </svg>
);
export const IcUser = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.8 20.2c1.2-3.4 3.9-5 7.2-5s6 1.6 7.2 5" />
  </svg>
);
export const IcUsers = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M2.8 19.6c1-3 3.3-4.4 6.2-4.4s5.2 1.4 6.2 4.4" />
    <path d="M15.5 5.6a3.2 3.2 0 1 1 1 6.2M17.6 15.4c2 .5 3.2 1.9 3.8 4.2" />
  </svg>
);
export const IcCog = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" />
  </svg>
);
export const IcLogout = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M14.5 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7.5" />
    <path d="M20 12h-8.5M17.5 8.5 21 12l-3.5 3.5" />
  </svg>
);
export const IcSearch = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20.5 20.5 16 16" />
  </svg>
);
export const IcFilter = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4 5.5h16l-6.2 7v5l-3.6 2v-7Z" />
  </svg>
);
export const IcDownload = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 4v10M8 10.5l4 4 4-4" />
    <path d="M4.5 16.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2.5" />
  </svg>
);
export const IcUpload = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 14.5v-10M8 8l4-4 4 4" />
    <path d="M4.5 16.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2.5" />
  </svg>
);
export const IcPrint = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M7 8V3.5h10V8" />
    <rect x="4" y="8" width="16" height="8" rx="1.5" />
    <path d="M7 13h10v7.5H7Z" />
    <path d="M16.5 10.8h.01" strokeWidth="2.6" />
  </svg>
);
export const IcCheck = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4.5 12.5 10 18 19.5 6.5" />
  </svg>
);
export const IcCheckCircle = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.2 12.3l2.6 2.7 5-5.8" />
  </svg>
);
export const IcX = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IcXCircle = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" />
  </svg>
);
export const IcAlert = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 3.6 2.8 19.4a1 1 0 0 0 .9 1.6h16.6a1 1 0 0 0 .9-1.6Z" />
    <path d="M12 9.5v4.5M12 17.4h.01" strokeWidth="2.4" />
  </svg>
);
export const IcInfo = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 7.6h.01" strokeWidth="2.4" />
  </svg>
);
export const IcBell = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M18 15.5H6l1.2-2V9.8A4.8 4.8 0 0 1 12 5a4.8 4.8 0 0 1 4.8 4.8v3.7Z" />
    <path d="M10 18.5a2 2 0 0 0 4 0" />
  </svg>
);
export const IcChevronDown = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);
export const IcChevronStart = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M14.5 6 8.5 12l6 6" />
  </svg>
);
export const IcChevronEnd = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M9.5 6l6 6-6 6" />
  </svg>
);
export const IcEye = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);
export const IcEyeOff = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4 4l16 16" />
    <path d="M9.9 6.2A9.4 9.4 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a17 17 0 0 1-3.2 3.8M6 8.2A16.4 16.4 0 0 0 2.5 12S6 18.2 12 18.2a9.3 9.3 0 0 0 3.5-.7" />
    <path d="M9.5 9.7a2.8 2.8 0 0 0 4 3.9" />
  </svg>
);
export const IcPlus = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IcPencil = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4 20l.9-3.6L15.6 5.7a1.8 1.8 0 0 1 2.6 0l.1.1a1.8 1.8 0 0 1 0 2.6L7.6 19.1Z" />
    <path d="M13.8 7.5l2.7 2.7" />
  </svg>
);
export const IcTrash = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4.5 6.5h15M9.5 6V4.5h5V6M6.5 6.5l.8 13a1 1 0 0 0 1 .9h7.4a1 1 0 0 0 1-.9l.8-13" />
    <path d="M10 10.5v6M14 10.5v6" />
  </svg>
);
export const IcCopy = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
    <path d="M5.5 15.5h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1" />
  </svg>
);
export const IcGrip = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M9 5.5h.01M15 5.5h.01M9 12h.01M15 12h.01M9 18.5h.01M15 18.5h.01" strokeWidth="2.8" />
  </svg>
);
export const IcStar = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8Z" />
  </svg>
);
export const IcTrophy = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M8 4h8v6a4 4 0 0 1-8 0Z" />
    <path d="M8 5.5H4.5a3.5 3.5 0 0 0 3.6 3.7M16 5.5h3.5a3.5 3.5 0 0 1-3.6 3.7" />
    <path d="M12 14v3.5M8.5 20.5h7M9.5 17.5h5v3h-5Z" />
  </svg>
);
export const IcMenu = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4 6.5h16M4 12h16M4 17.5h16" />
  </svg>
);
export const IcChart = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4 4v15.5h16" />
    <path d="M8 15.5v-4M12 15.5V7.5M16 15.5v-6" strokeWidth="2.4" />
  </svg>
);
export const IcSheet = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="4" y="3.5" width="16" height="17" rx="2" />
    <path d="M4 9h16M4 14.5h16M9.5 9v11.5M14.5 9v11.5" />
  </svg>
);
export const IcShield = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 3 5 5.8v5.4c0 4.4 3 7.9 7 9.3 4-1.4 7-4.9 7-9.3V5.8Z" />
    <path d="M9 11.6l2.2 2.2 3.8-4.4" />
  </svg>
);
export const IcWifi = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M3 9.5a13 13 0 0 1 18 0M6.2 13a8.5 8.5 0 0 1 11.6 0M9.4 16.3a4 4 0 0 1 5.2 0" />
    <path d="M12 19.5h.01" strokeWidth="2.8" />
  </svg>
);
export const IcWifiOff = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4 4l16 16" />
    <path d="M6.2 13a8.5 8.5 0 0 1 3.4-2M14.5 11.2a8.4 8.4 0 0 1 3.3 1.8M3 9.5A13 13 0 0 1 8 6.8M13.5 6.3A13 13 0 0 1 21 9.5M9.4 16.3a4 4 0 0 1 5.2 0" />
    <path d="M12 19.5h.01" strokeWidth="2.8" />
  </svg>
);
export const IcSave = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M5 4h11l3 3v13H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
    <path d="M8 4v4.5h7V4M8 20v-6h8v6" />
  </svg>
);
export const IcSend = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M20.5 3.5 3.5 10l6.5 2.5L12.5 19Z" />
    <path d="M20.5 3.5 10 12.5" />
  </svg>
);
export const IcMail = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="M4.5 7.5 12 13l7.5-5.5" />
  </svg>
);
export const IcPhone = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M7.5 3.5H5.6a1.6 1.6 0 0 0-1.6 1.7C4.3 12.6 11.4 19.7 18.8 20a1.6 1.6 0 0 0 1.7-1.6v-1.9l-3.6-1.4-1.6 1.6c-2.4-1-4.6-3.2-5.6-5.6l1.6-1.6Z" />
  </svg>
);
export const IcPin = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 21s-6.5-5.7-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.3 12 21 12 21Z" />
    <circle cx="12" cy="10.3" r="2.3" />
  </svg>
);
export const IcArrowUp = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);
export const IcArrowDown = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);
export const IcLink = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M10 14.5a4 4 0 0 0 6 .5l2.5-2.5a4 4 0 0 0-5.7-5.7L11.5 8" />
    <path d="M14 9.5a4 4 0 0 0-6-.5L5.5 11.5a4 4 0 0 0 5.7 5.7l1.3-1.2" />
  </svg>
);
export const IcExternal = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M13.5 5H19v5.5M19 5l-8 8" />
    <path d="M19 14.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4.5" />
  </svg>
);
export const IcTerminal = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <path d="M7 9.5l3 2.8-3 2.8M12.5 15.5H17" />
  </svg>
);
export const IcCode = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M8 7 3.5 12 8 17M16 7l4.5 5L16 17" />
  </svg>
);
export const IcDatabase = (p: P) => (
  <svg {...svgProps(p)}>
    <ellipse cx="12" cy="5.5" rx="7" ry="2.8" />
    <path d="M5 5.5V18.5c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V5.5" />
    <path d="M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" />
  </svg>
);
export const IcLayers = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 3.5 3 8l9 4.5L21 8Z" />
    <path d="M3 12.5l9 4.5 9-4.5M3 17l9 4.5L21 17" />
  </svg>
);
export const IcRefresh = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4.5 12a7.5 7.5 0 0 1 13-5.2L20 9M20 4.5V9h-4.5" />
    <path d="M19.5 12a7.5 7.5 0 0 1-13 5.2L4 15M4 19.5V15h4.5" />
  </svg>
);
export const IcArchive = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="3.5" y="4.5" width="17" height="4.5" rx="1" />
    <path d="M5 9v9.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
    <path d="M10 13h4" />
  </svg>
);
export const IcLock = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    <path d="M12 14.5v2" />
  </svg>
);
export const IcKey = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="8" cy="14.5" r="4" />
    <path d="M11 11.5 19.5 3M16 6.5l2.5 2.5M13.5 9l2 2" />
  </svg>
);
export const IcPlay = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10 8.5l5 3.5-5 3.5Z" />
  </svg>
);
export const IcFlag = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M6 21V4" />
    <path d="M6 4.5c4-2.2 8 2.2 12 0v8.8c-4 2.2-8-2.2-12 0" />
  </svg>
);
export const IcHistory = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4.5 8A8.5 8.5 0 1 1 3.5 12" />
    <path d="M3.5 7.5V12H8" />
    <path d="M12 8v4l2.8 1.8" />
  </svg>
);
export const IcQR = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
    <path d="M13.5 13.5h3v3h-3zM20 13.5v.01M16.5 20h.01M20 20h.01M13.5 20v-3.5" strokeWidth="2.2" />
  </svg>
);
export const IcBulb = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3.5a6 6 0 0 1 3.6 10.8c-.8.6-1.1 1.5-1.1 2.2v.5h-5v-.5c0-.7-.3-1.6-1.1-2.2A6 6 0 0 1 12 3.5Z" />
  </svg>
);
export const IcBan = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M6.2 6.2l11.6 11.6" />
  </svg>
);
export const IcBook = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 6.5c-2-1.7-5-2-8-1v13.2c3-1 6-.7 8 1 2-1.7 5-2 8-1V5.5c-3-1-6-.7-8 1Z" />
    <path d="M12 6.5v13.2" />
  </svg>
);
export const IcCap = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M2.5 9.5 12 5l9.5 4.5L12 14Z" />
    <path d="M6.5 11.8v4.4c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.4" />
    <path d="M21.5 9.5v5" />
  </svg>
);
export const IcDots = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M5.5 12h.01M12 12h.01M18.5 12h.01" strokeWidth="3" />
  </svg>
);
export const IcCircle = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="7.5" />
  </svg>
);
export const IcSquare = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="5.5" y="5.5" width="13" height="13" rx="2.5" />
  </svg>
);
export const IcSliders = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1" />
    <circle cx="15" cy="7" r="1.8" />
    <circle cx="9" cy="12" r="1.8" />
    <circle cx="17" cy="17" r="1.8" />
  </svg>
);

export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden>
      <rect x="1.25" y="1.25" width="37.5" height="37.5" rx="11" fill="#0A1633" />
      <rect x="1.25" y="1.25" width="37.5" height="37.5" rx="11" stroke="rgba(125,227,246,.4)" strokeWidth="1.2" />
      <path d="M14.5 13 8.5 20l6 7" stroke="#38CDEB" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25.5 13l6 7-6 7" stroke="#7E91E5" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="2.1" fill="#FBC556" />
    </svg>
  );
}
