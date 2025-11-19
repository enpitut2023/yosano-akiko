#!/usr/bin/env sh

rsync -avm \
    --include='*/' \
    --include='*.png' --include='*.svg' --include='*.ico' \
    --include='*.ttf' \
    --exclude='*' \
    src/ dist/ && \

./scripts/generate-help.sh && \
./scripts/generate-html.ts && \
find dist -name '*.html' -print0 | xargs -0 ./scripts/inject-matomo-tracker.ts
