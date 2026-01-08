import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import { db } from '@sim/db'

const logger = createLogger('ReadinessProbe')

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  const start = Date.now()
  try {
    // Simple query to check database connectivity
    await db.execute('SELECT 1')
    const latency = Date.now() - start

    return { healthy: true, latency }
  } catch (error) {
    logger.error('Database health check failed', { error })
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check Redis connectivity (if configured)
 */
async function checkRedis(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    return { healthy: true } // Redis is optional
  }

  const start = Date.now()
  try {
    // Dynamically import Redis to avoid errors if not configured
    const { default: Redis } = await import('ioredis')
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    })

    await redis.ping()
    const latency = Date.now() - start
    await redis.quit()

    return { healthy: true, latency }
  } catch (error) {
    logger.error('Redis health check failed', { error })
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Readiness probe - checks if the application is ready to serve traffic
 * This is used by Kubernetes to determine if the pod should receive traffic
 */
export async function GET() {
  try {
    const checks = await Promise.all([checkDatabase(), checkRedis()])

    const [databaseCheck, redisCheck] = checks

    const healthy = databaseCheck.healthy && redisCheck.healthy

    const response = {
      status: healthy ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseCheck,
        redis: redisCheck,
      },
    }

    logger.debug('Readiness check completed', { healthy, response })

    return NextResponse.json(response, { status: healthy ? 200 : 503 })
  } catch (error) {
    logger.error('Readiness check failed', { error })
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
