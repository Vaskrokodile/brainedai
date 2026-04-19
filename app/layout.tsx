import type { Metadata } from 'next';
import './globals.css';
import { ChatProvider } from '@/context/ChatContext';
import { BrainProvider } from '@/context/BrainContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { Sidebar } from '@/components/Sidebar';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Minecom Intelligence',
  description: 'AI-powered chat for Minecraft marketing',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23000" width="100" height="100" rx="20"/><text y="70" x="50" text-anchor="middle" font-size="60" fill="%23fff">M</text></svg>'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>
          <BrainProvider>
            <ChatProvider>
              <div className={styles.layout}>
                <Sidebar />
                <main className={styles.main}>
                  {children}
                </main>
              </div>
            </ChatProvider>
          </BrainProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
