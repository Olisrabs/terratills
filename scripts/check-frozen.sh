#!/bin/sh
set -e

echo "Verifying checksums of frozen public site files..."

if command -v sha256sum >/dev/null 2>&1; then
    sha256sum -c frozen-files.sha256
elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 -c frozen-files.sha256
else
    node -e "
    const fs = require('fs');
    const crypto = require('crypto');
    const lines = fs.readFileSync('frozen-files.sha256', 'utf8').trim().split('\n');
    let failed = false;
    for (const line of lines) {
      if (!line.trim()) continue;
      const [expectedHash, file] = line.split(/\s+/);
      if (!fs.existsSync(file)) {
        console.error('FAILED (missing): ' + file);
        failed = true;
        continue;
      }
      const actualHash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      if (actualHash === expectedHash) {
        console.log(file + ': OK');
      } else {
        console.error('FAILED (checksum mismatch): ' + file);
        failed = true;
      }
    }
    if (failed) process.exit(1);
    "
fi

echo "All frozen files are intact and verified!"
