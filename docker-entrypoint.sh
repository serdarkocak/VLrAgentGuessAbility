#!/bin/sh
set -e

# Coolify runtime env → tarayıcıda okunacak config (build gerekmez)
cat > /usr/share/nginx/html/env-config.js << EOF
window.__APP_CONFIG__ = {
  SUPABASE_URL: "${NEXT_PUBLIC_SUPABASE_URL:-}",
  SUPABASE_KEY: "${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:-}",
};
EOF

exec nginx -g 'daemon off;'
