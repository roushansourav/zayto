import type { Metadata } from "next";
import "../globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Zayto",
  description: "Your next food adventure awaits",
};

export default async function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeRegistry>
            <Header />
            {children}
            <Footer />
          </ThemeRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
