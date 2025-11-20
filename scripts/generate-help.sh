#!/usr/bin/env sh

echo 'Converting src/docs/help.md to dist/docs/help.html'
pandoc -s src/docs/help.md -o dist/docs/help.html
