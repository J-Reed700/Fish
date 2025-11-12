interface PerformanceTrace {
  name: string;
  startTime: number;
  attributes: Record<string, string>;
}

interface PerformanceMetrics {
  name: string;
  duration: number;
  attributes: Record<string, string>;
  timestamp: number;
}

class PerformanceMonitor {
  private traces: Map<string, PerformanceTrace> = new Map();
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;

  startTrace(name: string): PerformanceTraceInstance {
    const traceId = `${name}_${Date.now()}_${Math.random()}`;
    const trace: PerformanceTrace = {
      name,
      startTime: performance.now(),
      attributes: {},
    };

    this.traces.set(traceId, trace);

    return {
      putAttribute: (key: string, value: string) => {
        const t = this.traces.get(traceId);
        if (t) {
          t.attributes[key] = value;
        }
      },
      stop: () => {
        const t = this.traces.get(traceId);
        if (t) {
          const duration = performance.now() - t.startTime;
          this.recordMetric({
            name: t.name,
            duration,
            attributes: t.attributes,
            timestamp: Date.now(),
          });
          this.traces.delete(traceId);
        }
      },
    };
  }

  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    if (__DEV__) {
      const attrs = Object.entries(metric.attributes)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
      console.log(
        `[Performance] ${metric.name}: ${metric.duration.toFixed(2)}ms${attrs ? ` (${attrs})` : ''}`
      );
    }
  }

  getMetrics(name?: string): PerformanceMetrics[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageMetric(name: string): number | null {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return null;

    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  getPercentile(name: string, percentile: number): number | null {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return null;

    const sorted = filtered.map(m => m.duration).sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * sorted.length);
    return sorted[index];
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  getReport(): PerformanceReport {
    const traceNames = [...new Set(this.metrics.map(m => m.name))];
    const report: PerformanceReport = {};

    for (const name of traceNames) {
      const avg = this.getAverageMetric(name);
      const p50 = this.getPercentile(name, 50);
      const p95 = this.getPercentile(name, 95);
      const p99 = this.getPercentile(name, 99);
      const count = this.metrics.filter(m => m.name === name).length;

      report[name] = {
        count,
        avg: avg || 0,
        p50: p50 || 0,
        p95: p95 || 0,
        p99: p99 || 0,
      };
    }

    return report;
  }
}

export interface PerformanceTraceInstance {
  putAttribute: (key: string, value: string) => void;
  stop: () => void;
}

export interface PerformanceReport {
  [traceName: string]: {
    count: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
}

export const performanceMonitor = new PerformanceMonitor();
