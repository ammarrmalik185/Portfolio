import { useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";

const targets = [
    '[data-reveal]',
    `.${styles.portfolioHeroCopy} > *`,
    `.${styles.showcaseGrid} > *`
].join(',');

export default function useScrollReveal() {
    const container = useRef(null);

    useEffect(() => {
        const root = container.current;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!root || !('IntersectionObserver' in window)) return;

        const registered = new Set();
        const observer = new IntersectionObserver(entries => {
            entries.forEach(({ target, isIntersecting }) => {
                if (!isIntersecting) return;
                target.classList.remove(styles.revealPending);
                target.classList.add(styles.revealVisible);
                observer.unobserve(target);
            });
        }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });

        const register = () => {
            root.querySelectorAll(targets).forEach(element => {
                if (registered.has(element) || motion.matches) return;
                registered.add(element);
                const siblings = [...element.parentElement.children].filter(child => child.matches(targets));
                element.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(element), 5) * 70}ms`);
                element.classList.add(styles.revealPending);
                observer.observe(element);
            });
        };
        const updateMotion = () => {
            if (motion.matches) {
                observer.disconnect();
                registered.forEach(element => {
                    element.classList.remove(styles.revealPending, styles.revealVisible);
                });
            } else {
                register();
            }
        };

        register();
        // Portfolio data and the rich-text viewer arrive after the initial render.
        const mutations = new MutationObserver(register);
        mutations.observe(root, { childList: true, subtree: true });
        motion.addEventListener('change', updateMotion);

        return () => {
            observer.disconnect();
            mutations.disconnect();
            motion.removeEventListener('change', updateMotion);
            registered.forEach(element => {
                element.classList.remove(styles.revealPending, styles.revealVisible);
                element.style.removeProperty('--reveal-delay');
            });
        };
    }, []);

    return container;
}
