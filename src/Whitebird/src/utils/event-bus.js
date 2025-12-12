/**
 * Event Bus
 * Global event system for decoupled communication
 */

class EventBusClass {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to event once
   */
  once(event, callback) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };
    
    this.on(event, onceWrapper);
  }

  /**
   * Unsubscribe from an event
   */
  off(event, callback) {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  /**
   * Emit an event
   */
  emit(event, data) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  /**
   * Get all registered events
   */
  getEvents() {
    return Object.keys(this.events);
  }

  /**
   * Clear all event listeners
   */
  clear() {
    this.events = {};
  }

  /**
   * Clear specific event listeners
   */
  clearEvent(event) {
    delete this.events[event];
  }

  /**
   * Get listener count for event
   */
  listenerCount(event) {
    return this.events[event] ? this.events[event].length : 0;
  }
}

// Export singleton instance
export const EventBus = new EventBusClass();
export default EventBus;
