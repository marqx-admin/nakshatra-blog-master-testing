# Performance / noisy-neighbor harness

DOC-20 defines the LT20 scenarios and numeric SLO/fairness thresholds; DOC-21 QA21-PERF is the release execution authority. `lt20-scenarios.json` carries those frozen inputs for the future k6/telemetry harness.

The current CHAT01 source handoff has no production-shaped candidate, load environment or telemetry, so QA21-PERF-* is `NOT_EXECUTED`. Do not replace the required 14-site/100k-Post profile with a smaller percentage-based approximation, and do not accept throughput gains that weaken isolation, authorization, optimistic concurrency or derived-state correctness.
