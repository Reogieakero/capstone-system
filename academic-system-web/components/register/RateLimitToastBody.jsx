'use client';

import { useEffect, useState } from 'react';

export default function RateLimitToastBody({ initialSeconds = 60 }) {
  const [remaining, setRemaining] = useState(Math.max(0, initialSeconds));

  useEffect(() => {
    if (remaining <= 0) return undefined;

    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining]);

  return (
    <span>
      Too many attempts. Try again in <strong>{remaining}s</strong>.
    </span>
  );
}
