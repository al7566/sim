import { createLogger } from '@sim/logger'

const logger = createLogger('RetryPolicy')

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number // Maximum number of retry attempts
  initialDelay: number // Initial delay in ms
  maxDelay: number // Maximum delay in ms
  backoffMultiplier: number // Exponential backoff multiplier
  jitterFactor: number // Random jitter factor (0-1)
  retryableErrors?: string[] // Specific error messages/codes to retry
  retryableStatusCodes?: number[] // HTTP status codes to retry
}

/**
 * Default retry configuration
 */
const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  jitterFactor: 0.1,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504], // Transient errors
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any, config: RetryConfig): boolean {
  // Network errors are usually retryable
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true
  }

  // Check HTTP status codes
  if (error.status && config.retryableStatusCodes) {
    return config.retryableStatusCodes.includes(error.status)
  }

  // Check specific error messages
  if (config.retryableErrors && error.message) {
    return config.retryableErrors.some((msg) => error.message.includes(msg))
  }

  // 4xx errors (except rate limit) are not retryable
  if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
    return false
  }

  return true
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1)
  const cappedDelay = Math.min(exponentialDelay, config.maxDelay)

  // Add random jitter to prevent thundering herd
  const jitter = cappedDelay * config.jitterFactor * (Math.random() - 0.5)
  const delay = Math.max(0, cappedDelay + jitter)

  return Math.floor(delay)
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_CONFIG, ...config }
  let lastError: any

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === retryConfig.maxAttempts) {
        logger.error('Max retry attempts reached', { attempts: attempt, error })
        throw error
      }

      if (!isRetryableError(error, retryConfig)) {
        logger.warn('Non-retryable error encountered', { error })
        throw error
      }

      const delay = calculateDelay(attempt, retryConfig)
      logger.warn(`Retry attempt ${attempt}/${retryConfig.maxAttempts} after ${delay}ms`, {
        error: error.message,
      })

      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Create a retryable version of a function
 */
export function retryable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config?: Partial<RetryConfig>
): T {
  return ((...args: any[]) => withRetry(() => fn(...args), config)) as T
}

/**
 * Retry with custom condition
 */
export async function retryUntil<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_CONFIG, ...config }

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      const result = await fn()

      if (condition(result)) {
        return result
      }

      if (attempt === retryConfig.maxAttempts) {
        logger.error('Max retry attempts reached - condition not met', { attempts: attempt })
        throw new Error('Retry condition not met after max attempts')
      }

      const delay = calculateDelay(attempt, retryConfig)
      logger.info(`Retry attempt ${attempt}/${retryConfig.maxAttempts} - condition not met`, {
        delay,
      })

      await sleep(delay)
    } catch (error) {
      if (attempt === retryConfig.maxAttempts || !isRetryableError(error, retryConfig)) {
        throw error
      }

      const delay = calculateDelay(attempt, retryConfig)
      logger.warn(`Retry attempt ${attempt}/${retryConfig.maxAttempts} after error`, {
        error,
        delay,
      })

      await sleep(delay)
    }
  }

  throw new Error('Retry failed')
}
