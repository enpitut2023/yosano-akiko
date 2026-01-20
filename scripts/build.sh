#!/usr/bin/env sh

release=''
if [ -n "$AKIKO_RELEASE" ]
then
    release='true'
    echo 'Building in release mode'
else
    echo 'Building in debug mode'
fi

rsync -avm \
    --include='*/' \
    --include='*.png' --include='*.svg' --include='*.ico' \
    --include='*.ttf' \
    --include='robots.txt' \
    --exclude='*' \
    src/ dist/ || exit 1

npm run generate-html || exit 1
npm run esbuild || exit 1

if [ "$release" ]
then
    find dist -name '*.html' -print0 | xargs -0 npm run inject-matomo-tracker || exit 1
fi
