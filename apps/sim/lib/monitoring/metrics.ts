import { createLogger } from '@sim/logger'

const logger = createLogger('Metrics')

/**
 * Metric types
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}

/**
 * Metric data structure
 */
interface Metric {
  name: string
  type: MetricType
  help: string
  value: number
  labels?: Record<string, string>
  timestamp: number
}

/**
 * Histogram bucket
 */
interface HistogramBucket {
  le: number
  count: number
}

/**
 * Histogram metric data
 */
interface HistogramMetric extends Metric {
  buckets: HistogramBucket[]
  sum: number
  count: number
}

/**
 * Metrics registry
 */
class MetricsRegistry {
  private metrics: Map<string, Metric | HistogramMetric> = new Map()

  /**
   * Register or increment a counter
   */
  counter(name: string, help: string, labels?: Record<string, string>, value = 1): void {
    const key = this.getKey(name, labels)
    const existing = this.metrics.get(key)

    if (existing && existing.type === MetricType.COUNTER) {
      existing.value += value
      existing.timestamp = Date.now()
    } else {
      this.metrics.set(key, {
        name,
        type: MetricType.COUNTER,
        help,
        value,
        labels,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * Set a gauge value
   */
  gauge(name: string, help: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels)
    this.metrics.set(key, {
      name,
      type: MetricType.GAUGE,
      help,
      value,
      labels,
      timestamp: Date.now(),
    })
  }

  /**
   * Observe a histogram value
   */
  histogram(
    name: string,
    help: string,
    value: number,
    labels?: Record<string, string>,
    buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  ): void {
    const key = this.getKey(name, labels)
    const existing = this.metrics.get(key) as HistogramMetric | undefined

    if (existing && existing.type === MetricType.HISTOGRAM) {
      existing.sum += value
      existing.count++
      for (const bucket of existing.buckets) {
        if (value <= bucket.le) {
          bucket.count++
        }
      }
      existing.timestamp = Date.now()
    } else {
      const histogramBuckets = buckets.map((le) => ({
        le,
        count: value <= le ? 1 : 0,
      }))

      this.metrics.set(key, {
        name,
        type: MetricType.HISTOGRAM,
        help,
        value: 0,
        labels,
        timestamp: Date.now(),
        buckets: histogramBuckets,
        sum: value,
        count: 1,
      })
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): (Metric | HistogramMetric)[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const lines: string[] = []
    const groupedMetrics = new Map<string, (Metric | HistogramMetric)[]>()

    // Group metrics by name
    for (const metric of this.metrics.values()) {
      const existing = groupedMetrics.get(metric.name) || []
      existing.push(metric)
      groupedMetrics.set(metric.name, existing)
    }

    // Format each metric group
    for (const [name, metrics] of groupedMetrics) {
      const firstMetric = metrics[0]
      lines.push(`# HELP ${name} ${firstMetric.help}`)
      lines.push(`# TYPE ${name} ${firstMetric.type}`)

      for (const metric of metrics) {
        const labels = this.formatLabels(metric.labels)

        if (metric.type === MetricType.HISTOGRAM) {
          const hist = metric as HistogramMetric
          for (const bucket of hist.buckets) {
            lines.push(`${name}_bucket{${labels}le="${bucket.le}"} ${bucket.count}`)
          }
          lines.push(`${name}_bucket{${labels}le="+Inf"} ${hist.count}`)
          lines.push(`${name}_sum${labels ? `{${labels}}` : ''} ${hist.sum}`)
          lines.push(`${name}_count${labels ? `{${labels}}` : ''} ${hist.count}`)
        } else {
          lines.push(`${name}${labels ? `{${labels}}` : ''} ${metric.value}`)
        }
      }

      lines.push('')
    }

    return lines.join('\n')
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * Get metric key
   */
  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',')
    return `${name}{${labelStr}}`
  }

  /**
   * Format labels for Prometheus
   */
  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) return ''
    return (
      Object.entries(labels)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}="${v}"`)
        .join(',') + ','
    )
  }
}

/**
 * Global metrics registry
 */
export const metrics = new MetricsRegistry()

/**
 * Track payment success/failure rates
 */
export function trackPayment(
  provider: 'stripe' | 'clickbank' | 'paypal',
  success: boolean,
  amount?: number
): void {
  metrics.counter('payment_total', 'Total payment attempts', {
    provider,
    status: success ? 'success' : 'failure',
  })

  if (success && amount) {
    metrics.counter('payment_revenue_total', 'Total revenue', { provider }, amount)
  }
}

/**
 * Track API request metrics
 */
export function trackRequest(
  endpoint: string,
  method: string,
  status: number,
  duration: number
): void {
  metrics.counter('http_requests_total', 'Total HTTP requests', {
    endpoint,
    method,
    status: status.toString(),
  })

  metrics.histogram('http_request_duration_seconds', 'HTTP request duration', duration / 1000, {
    endpoint,
    method,
  })
}

/**
 * Track error rates
 */
export function trackError(service: string, errorType: string): void {
  metrics.counter('errors_total', 'Total errors', {
    service,
    type: errorType,
  })
}

/**
 * Set current gauge values
 */
export function setGauge(name: string, help: string, value: number, labels?: Record<string, string>): void {
  metrics.gauge(name, help, value, labels)
}
