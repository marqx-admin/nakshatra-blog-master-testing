# Evidence store

Every artifact in this tree is candidate-specific. `candidate/candidate.json` identifies the source candidate used for the current foundation. `results/qa21/qa21-status.json` materializes all 180 QA21 IDs; absence of actual runtime execution remains `NOT_EXECUTED` rather than being inferred from code or documentation.

Foundation self-check evidence lives under `results/foundation/` and uses `C12-FND-*` identifiers. Those checks prove the QA foundation itself can validate registries, collisions, source boundaries and OpenAPI provenance; they are not substitutes for QA21 runtime evidence.

For later QA21 runs, first capture the exact candidate identity and required EV21 artifacts. Use `bp-test-support record-result` only after execution. A PASS without evidence is rejected; FAIL requires a defect ID and `EV21-DEFECT`; BLOCKED requires a blocking reason; NOT_EXECUTED cannot contain claimed execution evidence.
