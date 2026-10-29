import { useEffect } from 'react';

/**
 * Adds `is-visible` to `.reveal` elements as they scroll into view.
 * Runs again whenever `deps` change (e.g. new data rendered).
 */
export function useReveal(deps = []) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.reveal'));
    if (nodes.length === 0) return undefined;

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
