// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Healthcare Triage Chatbot",
  description:
    "A Gemini-powered triage assistant that summarizes patient symptoms for doctors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-gray-900">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="max-w-5xl mx-auto px-6 py-4">
              <h1 className="text-2xl font-bold text-blue-700">
                TriageBot 🩺
              </h1>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-gray-200 text-center py-4 text-sm text-gray-700">
            <p>
              ⚠️ Disclaimer: This chatbot provides triage support only. It is
              not a substitute for professional medical advice.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
