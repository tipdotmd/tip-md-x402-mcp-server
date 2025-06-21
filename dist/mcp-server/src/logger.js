// Basic Logger Setup
export const logger = {
    info: (...args) => console.log('[x402]', ...args),
    error: (...args) => console.error('[x402 ERROR]', ...args),
    warn: (...args) => console.warn('[x402 WARN]', ...args),
    debug: (...args) => process.env.NODE_ENV !== 'production' ? console.debug('[x402 DEBUG]', ...args) : null,
};
