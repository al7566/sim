import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'

const logger = createLogger('LivenessProbe')

/**
 * Liveness probe - checks if the application is running
 * This is used by Kubernetes to determine if the pod should be restarted
 */
export async function GET() {
  try {
    // Basic check - if this endpoint responds, the app is alive
    const uptime = process.uptime()

    logger.debug('Liveness check successful', { uptime })

    return NextResponse.json(
      {
        status: 'ok',
        uptime: Math.floor(uptime),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Liveness check failed', { error })
    return NextResponse.json(
      {
        status: 'error',
        message: 'Application is not responding',
      },
      { status: 503 }
    )
  }
}
