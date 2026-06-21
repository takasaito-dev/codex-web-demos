import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KADOKKO AI Guide',
  description: 'おみやげ選び、金木町散策、食事予約をシンプルに案内するデモページです。',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f7f3ef',
};

const guideFallbackScript = `
(() => {
  if (window.__kadokkoGuideFallback) return;
  window.__kadokkoGuideFallback = true;

  const guideCards = ['diagnosis', 'products', 'routes', 'booking', 'dialect'];

  function getCardFromHash() {
    const card = window.location.hash.replace(/^#/, '');
    return guideCards.includes(card) ? card : null;
  }

  function syncGuidePanelsFromHash() {
    const card = getCardFromHash();
    if (!card) return;

    document.querySelectorAll('[data-guide-panel]').forEach((panel) => {
      panel.setAttribute('data-active', panel.getAttribute('data-guide-panel') === card ? 'true' : 'false');
    });

    document.querySelectorAll('[data-guide-card], [data-mobile-dock-card]').forEach((link) => {
      const linkCard = link.getAttribute('data-guide-card') || link.getAttribute('data-mobile-dock-card');
      link.setAttribute('data-current', linkCard === card ? 'true' : 'false');
    });
  }

  function syncBookingSummary(form) {
    if (!form) return;

    form.querySelectorAll('[data-booking-field]').forEach((field) => {
      if (!(field instanceof HTMLInputElement)) return;

      const key = field.getAttribute('data-booking-field');
      if (!key) return;

      const target = document.querySelector('[data-booking-summary="' + key + '"]');
      if (!target) return;

      const value = field.value.trim();
      const emptyText = target.getAttribute('data-booking-empty') || '-';
      const suffix = value ? target.getAttribute('data-booking-suffix') || '' : '';
      target.textContent = value ? value + suffix : emptyText;
    });
  }

  function handleBookingInput(event) {
    const field = event.target;
    if (!(field instanceof HTMLInputElement) || !field.matches('[data-booking-field]')) return;

    const form = field.closest('[data-booking-form]');
    syncBookingSummary(form);

    const confirmation = document.querySelector('[data-booking-confirmation]');
    if (confirmation) confirmation.setAttribute('data-status', 'pending');
  }

  document.addEventListener('input', handleBookingInput);
  document.addEventListener('change', handleBookingInput);
  window.addEventListener('hashchange', syncGuidePanelsFromHash);
  window.addEventListener('popstate', syncGuidePanelsFromHash);
  syncGuidePanelsFromHash();

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('[data-booking-form]')) return;

    event.preventDefault();
    syncBookingSummary(form);

    const confirmation = document.querySelector('[data-booking-confirmation]');
    if (!confirmation) return;

    confirmation.setAttribute('data-status', 'submitted');
    confirmation.scrollIntoView({ block: 'nearest' });
  });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Script id="kadokko-guide-fallback" strategy="afterInteractive">
          {guideFallbackScript}
        </Script>
      </body>
    </html>
  );
}
