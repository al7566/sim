import { createLogger } from '@sim/logger'

const logger = createLogger('CircuitBreaker')

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Blocking requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening circuit
  successThreshold: number // Number of successes in half-open before closing
  timeout: number // Time in ms before attempting to close circuit
  monitoringPeriod: number // Time window for counting failures
}

/**
 * Default circuit breaker configuration
 */
const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
  monitoringPeriod: 120000, // 2 minutes
}

/**
 * Circuit Breaker implementation
 * Prevents cascading failures by failing fast when a service is down
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount = 0
  private successCount = 0
  private nextAttempt: number = Date.now()
  private failures: number[] = []
  private readonly config: CircuitBreakerConfig
  private readonly name: string

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        logger.warn(`Circuit breaker ${this.name} is OPEN - rejecting request`)
        throw new Error(`Circuit breaker ${this.name} is OPEN`)
      }
      // Time to try half-open
      this.state = CircuitState.HALF_OPEN
      this.successCount = 0
      logger.info(`Circuit breaker ${this.name} transitioning to HALF_OPEN`)
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED
        this.successCount = 0
        this.failures = []
        logger.info(`Circuit breaker ${this.name} is now CLOSED`)
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    const now = Date.now()
    this.failures.push(now)

    // Remove old failures outside monitoring period
    this.failures = this.failures.filter(
      (timestamp) => now - timestamp < this.config.monitoringPeriod
    )

    this.failureCount = this.failures.length

    if (this.state === CircuitState.HALF_OPEN) {
      // Immediately open on failure in half-open state
      this.open()
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.open()
    }
  }

  /**
   * Open the circuit
   */
  private open(): void {
    this.state = CircuitState.OPEN
    this.nextAttempt = Date.now() + this.config.timeout
    logger.error(
      `Circuit breaker ${this.name} is now OPEN - ${this.failureCount} failures detected`
    )
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitState {
    return this.state
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.state === CircuitState.OPEN ? new Date(this.nextAttempt) : null,
    }
  }

  /**
   * Force reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.failures = []
    this.nextAttempt = Date.now()
    logger.info(`Circuit breaker ${this.name} has been reset`)
  }
}

/**
 * Global circuit breaker registry
 */
const circuitBreakers = new Map<string, CircuitBreaker>()

/**
 * Get or create a circuit breaker for a service
 */
export function getCircuitBreaker(
  name: string,
  config?: Partial<CircuitBreakerConfig>
): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name, config))
  }
  return circuitBreakers.get(name)!
}

/**
 * Execute a function with circuit breaker protection
 */
export async function withCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  const breaker = getCircuitBreaker(serviceName, config)
  return breaker.execute(fn)
}
