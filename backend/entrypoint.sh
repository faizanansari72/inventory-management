#!/bin/sh
set -e

# Wait for PostgreSQL to be reachable before starting the app.
echo "Checking database connection..."
until python -c "
import socket, os, sys
from urllib.parse import urlparse
db_url = os.environ.get('DATABASE_URL')
if db_url:
    try:
        p = urlparse(db_url)
        h, pt = p.hostname, p.port or 5432
    except Exception:
        h, pt = None, None
else:
    h = os.environ.get('POSTGRES_HOST')
    pt = os.environ.get('POSTGRES_PORT', '5432')

if not h:
    print('No database host configured (neither DATABASE_URL nor POSTGRES_HOST is set). Skipping wait.')
    sys.exit(0)

try:
    s = socket.socket()
    s.settimeout(2)
    if s.connect_ex((h, int(pt))) == 0:
        sys.exit(0)
    else:
        sys.exit(1)
except Exception as e:
    sys.exit(1)
" 2>/dev/null; do
  echo "Database is not ready yet - retrying in 2s..."
  sleep 2
done
echo "Database is up and reachable."

# Run database seeding if requested
if [ "$SEED_DATABASE" = "true" ] || [ "$AUTO_SEED" = "true" ]; then
  echo "Auto-seeding requested. Running seed.py..."
  python seed.py
fi

exec "$@"
