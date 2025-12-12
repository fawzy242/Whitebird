/**
 * Lock Screen Component
 * Handles screen locking functionality
 */

class LockScreenComponent {
  constructor() {
    this.isLocked = false;
  }

  /**
   * Lock the screen
   */
  lock() {
    localStorage.setItem('isLocked', 'true');
    localStorage.setItem('lockScreenTime', new Date().toISOString());
    this.isLocked = true;

    // Navigate to lock screen
    window.location.href = '/lockscreen';
  }

  /**
   * Unlock the screen (called from lockscreen page)
   */
  unlock() {
    localStorage.removeItem('isLocked');
    localStorage.removeItem('lockScreenTime');
    this.isLocked = false;

    // Navigate to dashboard
    window.location.href = '/dashboard';
  }

  /**
   * Check if screen is locked
   */
  isScreenLocked() {
    return localStorage.getItem('isLocked') === 'true';
  }
}

// Create singleton instance
export const lockScreen = new LockScreenComponent();
