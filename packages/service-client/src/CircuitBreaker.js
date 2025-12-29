/**
 * Circuit Breaker implementation
 * Prevents cascading failures by stopping requests to unhealthy services
 */

const STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

class CircuitBreaker {
  constructor(options = {}) {
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;

    // Configuration
    this.threshold = options.threshold || 5;           // Failures before opening
    this.timeout = options.timeout || 30000;           // Time before half-open (ms)
    this.resetTimeout = options.resetTimeout || 60000; // Time to reset failure count
    this.successThreshold = options.successThreshold || 2; // Successes to close from half-open
  }

  /**
   * Check if request can proceed
   * @returns {boolean}
   */
  canRequest() {
    if (this.state === STATES.CLOSED) {
      return true;
    }

    if (this.state === STATES.OPEN) {
      // Check if timeout has passed
      if (Date.now() >= this.nextAttempt) {
        this.state = STATES.HALF_OPEN;
        console.log('Circuit Breaker: وضعیت به HALF_OPEN تغییر کرد');
        return true;
      }
      return false;
    }

    // HALF_OPEN - allow one request
    return true;
  }

  /**
   * Record successful request
   */
  onSuccess() {
    if (this.state === STATES.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.reset();
        console.log('Circuit Breaker: وضعیت به CLOSED تغییر کرد');
      }
    } else if (this.state === STATES.CLOSED) {
      // Reset failure count after successful request
      this.failureCount = 0;
    }
  }

  /**
   * Record failed request
   */
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === STATES.HALF_OPEN) {
      this.trip();
    } else if (this.state === STATES.CLOSED && this.failureCount >= this.threshold) {
      this.trip();
    }
  }

  /**
   * Trip the circuit breaker (open it)
   */
  trip() {
    this.state = STATES.OPEN;
    this.nextAttempt = Date.now() + this.timeout;
    this.successCount = 0;
    console.log(`Circuit Breaker: وضعیت به OPEN تغییر کرد. تلاش بعدی در ${this.timeout}ms`);
  }

  /**
   * Reset the circuit breaker
   */
  reset() {
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
  }

  /**
   * Get current state
   * @returns {string}
   */
  getState() {
    return this.state;
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt
    };
  }
}

CircuitBreaker.STATES = STATES;

module.exports = CircuitBreaker;
