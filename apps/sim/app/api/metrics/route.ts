import { NextResponse } from 'next/server'
import { metrics } from '@/lib/monitoring/metrics'

/**
 * Metrics endpoint for Prometheus scraping
 * Returns metrics in Prometheus text format
 */
export async function GET() {
  try {
    const prometheusFormat = metrics.exportPrometheus()

    return new NextResponse(prometheusFormat, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to export metrics',
      },
      { status: 500 }
    )
  }
}
