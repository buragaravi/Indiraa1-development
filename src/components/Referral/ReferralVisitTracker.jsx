import { useEffect, useRef } from 'react';

/**
 * ReferralVisitTracker - Handles automatic tracking of referral visits
 * This component should be included on the landing page or main entry points
 * to track when users visit via referral links
 */
const ReferralVisitTracker = () => {
  const visitTracked = useRef(false);
  const visitId = useRef(null);
  const startTime = useRef(Date.now());
  const minVisitDuration = 2 * 60 * 1000; // 2 minutes in milliseconds

  // Generate a device fingerprint for unique visit tracking
  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.platform,
      navigator.cookieEnabled,
      localStorage.length,
      sessionStorage.length
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  };

  // Track the referral visit
  const trackReferralVisit = async (referralCode, deviceId, sessionId) => {
    try {
      console.log(`[VISIT TRACKER] Tracking referral visit for code: ${referralCode}`);
      
      const response = await fetch('http://localhost:5001/api/referral/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          referralCode,
          deviceFingerprint: deviceId,
          ipAddress: '127.0.0.1', // This should ideally be detected server-side
          userAgent: navigator.userAgent,
          browserInfo: {
            name: navigator.userAgent,
            platform: navigator.platform,
            isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
          },
          source: document.referrer || 'direct'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`[VISIT TRACKER] Visit tracked successfully, visitId: ${data.visitId}`);
        visitId.current = data.visitId;
        
        // Store tracking info to avoid duplicate tracking
        localStorage.setItem('lastReferralTrack', JSON.stringify({
          code: referralCode,
          deviceId,
          sessionId,
          visitId: data.visitId,
          timestamp: Date.now()
        }));
        
        return data.visitId;
      } else {
        console.error('[VISIT TRACKER] Failed to track visit:', data.message);
      }
    } catch (error) {
      console.error('[VISIT TRACKER] Error tracking referral visit:', error);
    }
    return null;
  };

  // Update visit duration when user leaves
  const updateVisitDuration = async (visitId, endTime) => {
    try {
      console.log(`[VISIT TRACKER] Updating visit duration for visitId: ${visitId}`);
      
      const response = await fetch('http://localhost:5001/api/referral/visit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          visitId,
          endTime: endTime.toISOString()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`[VISIT TRACKER] Visit duration updated: ${data.visitDuration}s, eligible: ${data.rewardEligible}`);
      } else {
        console.error('[VISIT TRACKER] Failed to update visit duration:', data.message);
      }
    } catch (error) {
      console.error('[VISIT TRACKER] Error updating visit duration:', error);
    }
  };

  // Check if this visit should be tracked
  const shouldTrackVisit = (referralCode, deviceId) => {
    const lastTrack = localStorage.getItem('lastReferralTrack');
    if (!lastTrack) return true;

    try {
      const trackData = JSON.parse(lastTrack);
      const timeSinceLastTrack = Date.now() - trackData.timestamp;
      const oneHour = 60 * 60 * 1000;

      // Don't track if same device and code within 1 hour
      if (trackData.code === referralCode && 
          trackData.deviceId === deviceId && 
          timeSinceLastTrack < oneHour) {
        return false;
      }
    } catch (e) {
      console.error('Error parsing last track data:', e);
    }

    return true;
  };

  // Handle page visibility change and beforeunload
  const handleVisitEnd = async () => {
    const visitDuration = Date.now() - startTime.current;
    const currentVisitId = visitId.current;
    
    console.log(`[VISIT TRACKER] Visit ending - duration: ${Math.floor(visitDuration/1000)}s, visitId: ${currentVisitId}`);
    
    if (currentVisitId && visitDuration >= 10000) { // Minimum 10 seconds to avoid accidental clicks
      await updateVisitDuration(currentVisitId, new Date());
    }
  };

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      console.log(`[VISIT TRACKER] Referral code found in URL: ${refCode}`);
      
      // Store referral code for this session
      sessionStorage.setItem('currentReferralCode', refCode);
      
      // Generate session ID if not exists
      if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', Math.random().toString(36).substring(2, 15));
      }
      
      // Set up visit tracking immediately
      const deviceId = generateDeviceFingerprint();
      const sessionId = sessionStorage.getItem('sessionId');
      
      if (shouldTrackVisit(refCode, deviceId)) {
        // Track the visit immediately
        trackReferralVisit(refCode, deviceId, sessionId).then((trackingVisitId) => {
          if (trackingVisitId) {
            visitId.current = trackingVisitId;
            visitTracked.current = true;
          }
        });
      }
    }
    
    // Also check if there's a stored referral code from previous page visit
    const storedRefCode = sessionStorage.getItem('currentReferralCode');
    if (storedRefCode && !refCode && !visitTracked.current) {
      console.log(`[VISIT TRACKER] Continuing tracking for stored referral code: ${storedRefCode}`);
      
      // Continue tracking for stored referral code
      const deviceId = generateDeviceFingerprint();
      const sessionId = sessionStorage.getItem('sessionId');
      
      // Check if we have a stored visit ID from localStorage
      const lastTrack = localStorage.getItem('lastReferralTrack');
      if (lastTrack) {
        try {
          const trackData = JSON.parse(lastTrack);
          if (trackData.visitId && trackData.code === storedRefCode) {
            visitId.current = trackData.visitId;
            visitTracked.current = true;
            console.log(`[VISIT TRACKER] Resuming tracking with visitId: ${trackData.visitId}`);
          }
        } catch (e) {
          console.error('[VISIT TRACKER] Error parsing stored track data:', e);
        }
      }
      
      // If no existing visit ID, create a new tracking
      if (!visitTracked.current && shouldTrackVisit(storedRefCode, deviceId)) {
        trackReferralVisit(storedRefCode, deviceId, sessionId).then((trackingVisitId) => {
          if (trackingVisitId) {
            visitId.current = trackingVisitId;
            visitTracked.current = true;
          }
        });
      }
    }

    // Set up event listeners for visit end
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable tracking on page unload
      if (visitId.current) {
        navigator.sendBeacon && navigator.sendBeacon(
          'http://localhost:5001/api/referral/visit',
          JSON.stringify({
            visitId: visitId.current,
            endTime: new Date().toISOString()
          })
        );
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleVisitEnd();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Final attempt to update visit duration
      if (visitId.current) {
        handleVisitEnd();
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default ReferralVisitTracker;
