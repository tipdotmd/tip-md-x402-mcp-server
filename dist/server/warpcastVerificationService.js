/**
 * Get verified GitHub username for a Farcaster FID using Warpcast API
 */
export async function getGithubVerification(fid) {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Server] Checking Warpcast GitHub verification for FID ${fid}`);
        }
        const response = await fetch(`https://api.warpcast.com/fc/account-verifications?platform=github&fid=${fid}`);
        if (!response.ok) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Server] Warpcast API error: ${response.status} ${response.statusText}`);
            }
            return null;
        }
        const data = await response.json();
        const verification = data.result?.verifications?.[0];
        if (verification?.platformUsername) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Server] Found verified GitHub username: ${verification.platformUsername} for FID ${fid}`);
            }
            return verification.platformUsername;
        }
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Server] No GitHub verification found for FID ${fid}`);
        }
        return null;
    }
    catch (error) {
        console.warn('[Server] Warpcast GitHub verification lookup failed:', error);
        return null;
    }
}
