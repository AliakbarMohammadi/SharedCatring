#!/bin/bash

find . -name "package.json" -not -path "*/node_modules/*" | while read package; do
    dir=$(dirname "$package")
    echo "=================================="
    echo "Installing dependencies in: $dir"
    echo "=================================="
    cd "$dir"
    npm install . --verbos
    cd -
done
