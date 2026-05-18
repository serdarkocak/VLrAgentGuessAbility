import { useState } from 'react';
import { getSupabaseStatus } from '../lib/supabaseConfig.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function SupabaseDiagnostics() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const status = getSupabaseStatus();

  if (status.configured) return null;

  return (
    <div className="mt-3 rounded-sm border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-200/90">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between font-semibold text-yellow-300"
      >
        {t('diagnostics.title')}
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <ul className="mt-2 space-y-1 font-mono text-xs">
          <li>
            {t('diagnostics.runtimeUrl')}:{' '}
            {status.runtime.hasUrl ? status.runtime.urlHost : t('diagnostics.missing')}
          </li>
          <li>
            {t('diagnostics.runtimeKey')}:{' '}
            {status.runtime.hasKey ? t('diagnostics.present') : t('diagnostics.missing')}
          </li>
          <li>
            {t('diagnostics.buildUrl')}:{' '}
            {status.build.hasUrl ? status.build.urlHost : t('diagnostics.missing')}
          </li>
          <li>
            {t('diagnostics.buildKey')}:{' '}
            {status.build.hasKey ? t('diagnostics.present') : t('diagnostics.missing')}
          </li>
          <li>
            {t('diagnostics.activeSource')}: <strong>{status.source}</strong>
          </li>
        </ul>
      )}

      <p className="mt-2 text-xs text-yellow-200/70">{t('diagnostics.hint')}</p>
    </div>
  );
}
