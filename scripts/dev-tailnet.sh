#!/bin/sh
# Runs the dev server and serves it to your tailnet over HTTPS, at the URL
# `tailscale serve` prints, until the dev server stops.
set -eu

tailscale serve http://localhost:42263 &
trap 'kill $! 2>/dev/null' EXIT INT TERM
# Otherwise Vite would move to another port when 42263 is taken, and the
# forwarding would reach whatever holds it
vite dev --strictPort "$@"
