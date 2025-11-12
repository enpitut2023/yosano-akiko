#!/usr/bin/env sh

./scripts/generate-help.sh
./scripts/generate-html.ts
find public -name '*.html' -print0 | xargs -0 ./scripts/inject-matomo-tracker.ts
