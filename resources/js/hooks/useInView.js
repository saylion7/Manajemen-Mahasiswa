import { useState, useEffect, useRef } from 'react';

export default function useInView() {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let fired = false;
        const reveal = () => {
            if (fired) return;
            fired = true;
            window.removeEventListener('scroll', onCheck);
            window.removeEventListener('touchmove', onCheck);
            setInView(true);
        };

        const onCheck = () => {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            if (rect.top < vh + 50 && rect.bottom > -50) {
                reveal();
            }
        };

        onCheck();
        window.addEventListener('scroll', onCheck, { passive: true });
        window.addEventListener('touchmove', onCheck, { passive: true });

        const fallback = setTimeout(reveal, 300);

        return () => {
            clearTimeout(fallback);
            window.removeEventListener('scroll', onCheck);
            window.removeEventListener('touchmove', onCheck);
        };
    }, []);

    return [ref, inView];
}
