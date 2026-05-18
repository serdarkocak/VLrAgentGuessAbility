import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

export default function Layout({ children }) {
  const location = useLocation();
  const isGame = location.pathname === '/play';
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-valorant-dark/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-valorant-red font-valorant text-sm text-white">
              V
            </span>
            <span className="font-valorant text-lg leading-none text-white transition hover:text-valorant-red">
              ABILITY QUIZ
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <LanguageSwitcher />
            {isGame ? (
              <Link
                to="/"
                className="text-sm uppercase tracking-wider text-white/40 transition hover:text-white"
              >
                {t('nav.exit')}
              </Link>
            ) : (
              <Link
                to="/leaderboard"
                className="text-sm uppercase tracking-wider text-white/40 transition hover:text-white"
              >
                {t('nav.leaderboard')}
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>

      {!isGame && (
        <footer className="border-t border-white/5 py-4 text-center text-xs text-white/20">
          {t('footer')}
        </footer>
      )}
    </div>
  );
}
