// Basic Logger Setup
export const logger = {
  info: (...args: any[]) => console.log('[x402]', ...args),
  error: (...args: any[]) => console.error('[x402 ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[x402 WARN]', ...args),
  debug: (...args: any[]) => process.env.NODE_ENV !== 'production' ? console.debug('[x402 DEBUG]', ...args) : null,
}; 