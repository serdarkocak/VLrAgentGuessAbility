import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import RiotDisclaimer from '../components/RiotDisclaimer.jsx';

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL?.trim() || '';

export default function Privacy() {
  const { t } = useLanguage();
  const sections = t('legal.privacy.sections');

  return (
    <motion.article
      className="mx-auto max-w-2xl space-y-8 pb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="space-y-3">
        <Link
          to="/"
          className="text-sm uppercase tracking-wider text-white/40 transition hover:text-white"
        >
          ← {t('nav.home')}
        </Link>
        <h1 className="font-valorant text-4xl text-valorant-red">{t('legal.privacy.title')}</h1>
        <p className="text-sm text-white/40">{t('legal.privacy.lastUpdated')}</p>
      </header>

      <div className="card-panel border-valorant-red/20 p-5">
        <RiotDisclaimer />
      </div>

      <p className="text-sm leading-relaxed text-white/70">{t('legal.privacy.intro')}</p>

      {Array.isArray(sections) &&
        sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-valorant text-2xl text-white">{section.title}</h2>
            {section.body && (
              <p className="text-sm leading-relaxed text-white/60">{section.body}</p>
            )}
            {section.list && (
              <ul className="list-disc space-y-2 pl-5 text-sm text-white/60">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.links && (
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-valorant-red underline decoration-valorant-red/30 underline-offset-2 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

      <section className="card-panel space-y-2 p-5 text-sm text-white/60">
        <h2 className="font-valorant text-xl text-white">{t('legal.privacy.contactTitle')}</h2>
        <p>{t('legal.privacy.contactBody')}</p>
        {CONTACT_EMAIL ? (
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-block text-valorant-red hover:text-white"
          >
            {CONTACT_EMAIL}
          </a>
        ) : (
          <p className="text-white/40">{t('legal.privacy.contactNoEmail')}</p>
        )}
      </section>
    </motion.article>
  );
}
