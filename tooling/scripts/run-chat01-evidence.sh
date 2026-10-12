#!/bin/sh
set -eu

node tooling/scripts/check-openapi-source.mjs
python3 tooling/scripts/verify-openapi-contract.py --json-out evidence/chat01/openapi-verification.json
node tooling/generators/generate-api-contract.mjs
node tooling/scripts/check-generated-drift.mjs
node tooling/scripts/check-foundation.mjs
node tooling/scripts/check-js-boundaries.mjs
python3 tooling/scripts/check-python-boundaries.py
python3 tooling/scripts/check-python-namespaces.py
node tooling/scripts/check-format.mjs
tsc --noEmit -p tsconfig.foundation.json
uv lock --offline --check
uv sync --offline --frozen --all-packages
node --test tests/dependency/foundation.test.mjs tests/contract/openapi-contract.test.mjs

printf '%s\n' 'CHAT01 foundation + approved RC13 contract checks complete.'
