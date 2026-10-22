import type {AdaptiveScheduler} from '../types';

export const createBrowserScheduler = (): AdaptiveScheduler => {
    if (typeof window === 'undefined') {
        return {
            now: () => Date.now(),
            requestAfterPaint: () => () => undefined,
            requestFrame: () => () => undefined,
            setTimer: () => () => undefined,
        };
    }
    return {
        now: () => (typeof performance === 'undefined' ? Date.now() : performance.now()),
        requestFrame(callback) {
            if (window.requestAnimationFrame) {
                const id = window.requestAnimationFrame(callback);
                return () => window.cancelAnimationFrame(id);
            }
            const id = setTimeout(callback, 16);
            return () => clearTimeout(id);
        },
        requestAfterPaint(callback) {
            let active = true;
            let releaseTask: (() => void) | null = null;
            const releaseFrame = this.requestFrame(() => {
                if (!active) {
                    return;
                }
                if (typeof MessageChannel === 'function') {
                    const channel = new MessageChannel();
                    channel.port1.onmessage = () => {
                        channel.port1.close();
                        channel.port2.close();
                        if (active) {
                            return callback();
                        }
                        return undefined;
                    };
                    channel.port2.postMessage(undefined);
                    releaseTask = () => {
                        channel.port1.onmessage = null;
                        channel.port1.close();
                        channel.port2.close();
                    };
                } else {
                    const id = setTimeout(() => active && callback(), 0);
                    releaseTask = () => clearTimeout(id);
                }
            });
            return () => {
                active = false;
                releaseFrame();
                releaseTask?.();
            };
        },
        setTimer(callback, delay) {
            const id = setTimeout(callback, delay);
            return () => clearTimeout(id);
        },
    };
};
