#!/usr/bin/env sh

if [ $# -eq 0 ]
then
    echo "Usage: $0 [file.svg ...]" 1>&2
    exit 1
fi

temp_file="$(mktemp).svg"

for f in "$@"
do
    printf 'Optimizing %s: ' "$f"
    svgcleaner --multipass "$f" "$temp_file"
    mv "$temp_file" "$f"
done
