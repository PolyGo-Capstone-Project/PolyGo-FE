"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if the user is on a mobile/tablet device
 * Returns true for iOS, Android, mobile browsers
 */
export function useMobileDevice() {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);

  useEffect(() => {
    const checkMobileDevice = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera;

      // Check for mobile devices
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobile = mobileRegex.test(userAgent);

      // Check for touch support (additional check)
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

      // Check for small screen (as additional indicator)
      const isSmallScreen = window.innerWidth <= 1024;

      setIsMobileDevice(isMobile || (hasTouch && isSmallScreen));
    };

    checkMobileDevice();

    // Re-check on resize (for device rotation)
    window.addEventListener("resize", checkMobileDevice);
    return () => window.removeEventListener("resize", checkMobileDevice);
  }, []);

  return isMobileDevice;
}
