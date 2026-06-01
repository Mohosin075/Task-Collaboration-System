import type { Metadata } from 'next';
import './globals.css';
import ReduxProvider from '@/components/ReduxProvider';

export const metadata: Metadata = {
  title: 'Smart Project & Task Collaboration System',
  description: 'Enterprise task management and workflow tracking platform for remote teams.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased transition-colors duration-300">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
