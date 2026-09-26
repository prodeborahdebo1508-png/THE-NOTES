import './globals.css';

export const metadata = {
  title: 'Notizen',
  description: 'Persönliche Notizen im Hello-Kitty-Stil',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Notizen',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
