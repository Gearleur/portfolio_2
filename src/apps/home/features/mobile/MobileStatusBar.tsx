import { useEffect, useState } from 'react';

function formatStatusTime(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function MobileStatusBar() {
  const [time, setTime] = useState(() => formatStatusTime(new Date()));

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTime(formatStatusTime(new Date()));
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="mobile-status-bar" aria-label="Status">
      <div className="mobile-status-bar__network">
        <span className="mobile-signal" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span className="mobile-network-type">4G</span>
      </div>
      <time>{time}</time>
      <div className="mobile-battery" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
