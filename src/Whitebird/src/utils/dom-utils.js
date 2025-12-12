/**
 * DOM Utilities
 * Helper functions for DOM manipulation
 */

export class DOMUtils {
  /**
   * Create element with attributes
   */
  static createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith('on')) {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    if (content) {
      if (typeof content === 'string') {
        element.textContent = content;
      } else if (content instanceof Node) {
        element.appendChild(content);
      }
    }

    return element;
  }

  /**
   * Query selector with error handling
   */
  static qs(selector, parent = document) {
    return parent.querySelector(selector);
  }

  /**
   * Query selector all
   */
  static qsa(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  }

  /**
   * Add event listener with delegation
   */
  static on(parent, eventType, selector, handler) {
    parent.addEventListener(eventType, (e) => {
      const target = e.target.closest(selector);
      if (target) {
        handler.call(target, e);
      }
    });
  }

  /**
   * Debounce function
   */
  static debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  static throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Sanitize HTML string
   */
  static sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  /**
   * Insert HTML safely
   */
  static insertHTML(element, html, position = 'beforeend') {
    const template = document.createElement('template');
    template.innerHTML = html.trim();

    switch (position) {
      case 'beforebegin':
        element.parentNode.insertBefore(template.content, element);
        break;
      case 'afterbegin':
        element.insertBefore(template.content, element.firstChild);
        break;
      case 'beforeend':
        element.appendChild(template.content);
        break;
      case 'afterend':
        element.parentNode.insertBefore(template.content, element.nextSibling);
        break;
    }
  }

  /**
   * Remove element
   */
  static remove(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  /**
   * Toggle class
   */
  static toggleClass(element, className, force) {
    if (force !== undefined) {
      element.classList.toggle(className, force);
    } else {
      element.classList.toggle(className);
    }
  }

  /**
   * Get element offset
   */
  static getOffset(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset,
      width: rect.width,
      height: rect.height,
    };
  }

  /**
   * Scroll to element
   */
  static scrollTo(element, options = {}) {
    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    };

    element.scrollIntoView({ ...defaultOptions, ...options });
  }

  /**
   * Create DocumentFragment for batch DOM operations
   */
  static createFragment(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
  }

  /**
   * Batch DOM updates
   */
  static batchUpdate(callback) {
    requestAnimationFrame(() => {
      callback();
    });
  }

  /**
   * Wait for element to exist
   */
  static waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = this.qs(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = this.qs(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Check if element is in viewport
   */
  static isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Get computed style value
   */
  static getStyle(element, property) {
    return window.getComputedStyle(element).getPropertyValue(property);
  }

  /**
   * Set multiple styles
   */
  static setStyles(element, styles) {
    Object.entries(styles).forEach(([property, value]) => {
      element.style[property] = value;
    });
  }
}

export default DOMUtils;
