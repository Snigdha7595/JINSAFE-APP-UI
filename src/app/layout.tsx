import type { Metadata, Viewport } from 'next';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';
import "react-datepicker/dist/react-datepicker.css";
import '@/styles/globals.scss';
import { primaryFont, SecondaryFont } from '@/config/fonts';
import CustomLayout from '@/components/Layouts/CustomLayout';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SessionTimeoutHandler from "@/components/SessionTimeoutHandler";
import { StoreProvider } from '@/store/storeProviders';


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Jinsafe App',
  description: 'Jinsafe App'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <body
          suppressHydrationWarning={true}
          className={`admin-mainWrapper ${primaryFont.variable} ${SecondaryFont.variable}`}
        >
          <CustomLayout>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
              <SessionTimeoutHandler />
              {children}
            </GoogleOAuthProvider>
          </CustomLayout>
        </body>
      </html>
    </StoreProvider>
  );
}
