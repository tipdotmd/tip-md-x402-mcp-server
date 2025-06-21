/**
 * Environment detection utilities for MCP server
 * Handles both standalone (public repo) and integrated (private repo) modes
 */

export const isStandaloneMode = (): boolean => {
  // Check if we're running without the main repo dependencies
  return !process.env.MONGODB_URI || 
         process.env.NODE_ENV === 'demo' || 
         process.env.MCP_MODE === 'standalone';
};

export const isIntegratedMode = (): boolean => {
  return !isStandaloneMode();
};

export const getEnvironmentInfo = () => {
  const mode = isStandaloneMode() ? 'standalone' : 'integrated';
  const hasMongoUri = !!process.env.MONGODB_URI;
  const hasCdpKey = !!process.env.CDP_API_KEY_ID;
  
  return {
    mode,
    hasMongoUri,
    hasCdpKey,
    isDemo: process.env.NODE_ENV === 'demo',
    isProduction: process.env.NODE_ENV === 'production'
  };
};

export const logEnvironmentStatus = () => {
  const info = getEnvironmentInfo();
  const logger = {
    info: (...args: any[]) => console.log('[Environment]', ...args),
    warn: (...args: any[]) => console.warn('[Environment WARN]', ...args),
  };
  
  if (info.mode === 'standalone') {
    logger.warn('🏆 Hackathon Demo Mode Active');
    logger.warn('└── Running in standalone mode for demonstration');
    if (!info.hasMongoUri) {
      logger.warn('└── Missing MongoDB URI - using demo responses');
    }
    if (!info.hasCdpKey) {
      logger.warn('└── Missing CDP credentials - using demo responses');
    }
    logger.warn('└── To see full integration, configure .env file');
  } else {
    logger.info('🚀 Integrated Mode Active');
    logger.info('└── Connected to main GitTipStream infrastructure');
  }
}; 