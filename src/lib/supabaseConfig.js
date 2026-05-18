const PLACEHOLDER_URLS = new Set(['https://your-project.supabase.co', '']);

function readRuntimeConfig() {
  if (typeof window === 'undefined') return { url: '', key: '' };
  const cfg = window.__APP_CONFIG__ ?? {};
  return {
    url: cfg.SUPABASE_URL?.trim() ?? '',
    key: cfg.SUPABASE_KEY?.trim() ?? '',
  };
}

function readBuildConfig() {
  return {
    url: (
      import.meta.env.VITE_SUPABASE_URL ??
      import.meta.env.NEXT_PUBLIC_SUPABASE_URL ??
      ''
    ).trim(),
    key: (
      import.meta.env.VITE_SUPABASE_ANON_KEY ??
      import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      ''
    ).trim(),
  };
}

/** Runtime (Coolify) öncelikli, yoksa Vite build env */
export function getSupabaseCredentials() {
  const runtime = readRuntimeConfig();
  if (runtime.url && runtime.key) {
    return { ...runtime, source: 'runtime' };
  }
  const build = readBuildConfig();
  if (build.url && build.key) {
    return { ...build, source: 'build' };
  }
  return { url: runtime.url || build.url, key: runtime.key || build.key, source: 'none' };
}

export function isValidSupabaseConfig(url, key) {
  return Boolean(url && key && !PLACEHOLDER_URLS.has(url));
}

/** Teşhis — anahtarın tamamı asla döndürülmez */
export function getSupabaseStatus() {
  const runtime = readRuntimeConfig();
  const build = readBuildConfig();
  const active = getSupabaseCredentials();

  return {
    configured: isValidSupabaseConfig(active.url, active.key),
    source: active.source,
    runtime: {
      hasUrl: Boolean(runtime.url),
      hasKey: Boolean(runtime.key),
      urlHost: safeHost(runtime.url),
    },
    build: {
      hasUrl: Boolean(build.url),
      hasKey: Boolean(build.key),
      urlHost: safeHost(build.url),
    },
    active: {
      urlHost: safeHost(active.url),
      keyPrefix: active.key ? `${active.key.slice(0, 16)}…` : null,
    },
  };
}

function safeHost(url) {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return 'invalid-url';
  }
}
