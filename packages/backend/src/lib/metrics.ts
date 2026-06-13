import client from "prom-client";

// Domyślne metryki Node.js (CPU, pamięć, event loop)
client.collectDefaultMetrics();

// Metryki HTTP
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// Metryki biznesowe
export const transactionsCreated = new client.Counter({
  name: "transactions_created_total",
  help: "Total number of transactions created",
  labelNames: ["type"],
});

export const advisorRequests = new client.Counter({
  name: "advisor_requests_total",
  help: "Total number of advisor requests",
});

export const advisorDuration = new client.Histogram({
  name: "advisor_response_duration_seconds",
  help: "Duration of advisor LLM responses",
  buckets: [1, 2, 5, 10, 20, 30, 60],
});

export const activeUsers = new client.Gauge({
  name: "active_users",
  help: "Number of currently active users (logged in within last 5 min)",
});

export const register = client.register;