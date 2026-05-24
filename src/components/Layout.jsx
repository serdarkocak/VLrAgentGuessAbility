import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import RiotDisclaimer from './RiotDisclaimer.jsx';
import BackgroundShapes from './BackgroundShapes.jsx';
import VLogo from './VLogo.jsx';

export default function Layout({ children }) {
  const location = useLocation();
  const isGame = location.pathname === '/play';
  const { t } = useLanguage();

  return (
    <>
      <BackgroundShapes />
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 px-3 pt-3">
          <div className="mx-auto flex max-w-2xl items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 backdrop-blur-xl shadow-glass">
            <Link to="/" className="group flex items-center gap-2.5">
              <VLogo size={36} className="transition group-hover:scale-105" />
              <span className="font-valorant text-lg leading-none tracking-[0.18em] text-white text-glow-white transition group-hover:text-valorant-red">
                ABILITY <span className="text-valorant-red">QUIZ</span>
              </span>
            </Link>

            <nav className="flex items-center gap-3">
              <LanguageSwitcher />
              {isGame ? (
                <Link
                  to="/"
                  className="text-sm uppercase tracking-wider text-white/50 transition hover:text-white"
                >
                  {t('nav.exit')}
                </Link>
              ) : (
                <Link
                  to="/leaderboard"
                  className="text-sm uppercase tracking-wider text-white/50 transition hover:text-white"
                >
                  {t('nav.leaderboard')}
                </Link>
              )}
            </nav>
          </div>
        </header>

        {/* Absolute Left Fixed Advertisement Panel (Skyscraper) */}
        <aside className="fixed left-4 top-24 bottom-6 z-30 hidden w-[160px] flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-2 text-center xl:flex">
          <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">
            REKLAM / ADS
          </span>
          <div className="flex h-full flex-col items-center justify-center rounded-lg bg-black/45 border border-dashed border-white/10 p-2 text-[10px] text-white/20 select-none">
            <span className="text-lg mb-1">📢</span>
            <span>160x600</span>
            <span>Skyscraper Ad</span>
            <span className="text-[8px] text-white/10 mt-2">Active Sponsor Banner</span>
          </div>
        </aside>

        {/* Absolute Right Fixed Advertisement Panel (Skyscraper) */}
        <aside className="fixed right-4 top-24 bottom-6 z-30 hidden w-[160px] flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-2 text-center xl:flex">
          <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">
            REKLAM / ADS
          </span>
          <div className="flex h-full flex-col items-center justify-center rounded-lg bg-black/45 border border-dashed border-white/10 p-2 text-[10px] text-white/20 select-none">
            <span className="text-lg mb-1">📢</span>
            <span>160x600</span>
            <span>Skyscraper Ad</span>
            <span className="text-[8px] text-white/10 mt-2">Active Sponsor Banner</span>
          </div>
        </aside>

        {/* Main Content Column */}
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
          {children}
        </main>

        {!isGame && (
          <footer className="mx-auto w-full max-w-2xl space-y-3 px-4 pb-6">
            <div className="card-panel space-y-3 p-5 text-center">
              <RiotDisclaimer compact />
              <p className="text-xs text-white/40">
                <Link
                  to="/privacy"
                  className="uppercase tracking-wider underline decoration-white/20 underline-offset-2 transition hover:text-neon-pink"
                >
                  {t('footer.privacy')}
                </Link>
              </p>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}
