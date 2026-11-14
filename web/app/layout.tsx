import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Yala Insight — แดชบอร์ดนักท่องเที่ยว วัดคูหาภิมุข",
    template: "%s | Yala Insight",
  },
  description:
    "แดชบอร์ดวิเคราะห์ข้อมูลแบบสำรวจนักท่องเที่ยว ณ วัดคูหาภิมุข (วัดหน้าถ้ำ) เพื่อช่วยผู้ประกอบการท่องเที่ยวอำเภอเมืองยะลาตัดสินใจ",
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('yala-insight-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${notoSansThai.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-canvas text-ink font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
