import { useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import html2canvas from 'html2canvas';

export default function ShareCard({ score, correct, total, mode, difficulty, nickname }) {
  const { t, tMode, tDifficulty, locale } = useLanguage();
  const cardRef = useRef(null);
  const [copyState, setCopyState] = useState('copy'); // 'copy' | 'copying' | 'copied'
  const [isCapturing, setIsCapturing] = useState(false);

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const text = t('result.shareText', {
    score,
    correct,
    total,
    mode: tMode(mode),
    difficulty: tDifficulty(difficulty),
  });

  const getCongratsText = () => {
    if (locale === 'tr') {
      if (accuracy >= 90) return 'MÜKEMMELSİN! 🔥';
      if (accuracy >= 70) return 'TEBRİKLER! 🎯';
      if (accuracy >= 50) return 'İYİ OYUN! 👍';
      return 'TEKRAR DENE! 💥';
    } else {
      if (accuracy >= 90) return 'AMAZING! 🔥';
      if (accuracy >= 70) return 'CONGRATULATIONS! 🎯';
      if (accuracy >= 50) return 'GOOD GAME! 👍';
      return 'TRY AGAIN! 💥';
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsCapturing(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null, // Arka plan şeffaf bırakılır (resim görünür)
        scale: 2, // Yüksek çözünürlük için
        useCORS: true, // Harici / public resimleri sorunsuz yüklemek için
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsCapturing(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nickname || 'ajan'}-valorant-score.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const noticeText = locale === 'tr'
          ? '\n\n(Not: İndirilen görseli tivitine eklemeyi unutma! 📸)'
          : "\n\n(Note: Don't forget to attach the downloaded image to your tweet! 📸)";

        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text + noticeText
        )}`;
        window.open(shareUrl, '_blank');

        setIsCapturing(false);
      }, 'image/png');
    } catch (err) {
      console.error('Share capture error:', err);
      setIsCapturing(false);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;
    setCopyState('copying');

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setCopyState('copy');
          return;
        }

        try {
          // Sistem panosuna resmi doğrudan PNG olarak kopyalamayı dene (Chrome, Safari vb.)
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            setCopyState('copied');
            setTimeout(() => setCopyState('copy'), 2500);
          } else {
            throw new Error('ClipboardItem is not supported on this browser.');
          }
        } catch (clipErr) {
          console.warn('Görsel panoya kopyalanamadı, metin kopyalama moduna geçiliyor:', clipErr);
          // Tarayıcı desteklemiyorsa düz metin olarak kopyala (Mobil vb.)
          await navigator.clipboard?.writeText(text);
          setCopyState('copied');
          setTimeout(() => setCopyState('copy'), 2500);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Panoya kopyalama hatası:', err);
      // Hata durumunda en temel metin kopyalamayı dene
      try {
        await navigator.clipboard?.writeText(text);
        setCopyState('copied');
        setTimeout(() => setCopyState('copy'), 2500);
      } catch (fallbackErr) {
        setCopyState('copy');
      }
    }
  };

  return (
    <div className="card-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-valorant text-xl text-valorant-red">{t('result.shareTitle')}</h3>
        <p className="mt-1 text-sm text-white/60">{t('result.shareDesc')}</p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleShare}
          disabled={isCapturing}
          className="btn-primary flex items-center justify-center min-w-[120px]"
        >
          {isCapturing ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            t('result.shareOnX')
          )}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={copyState === 'copying'}
          className={`btn-secondary min-w-[120px] flex items-center justify-center transition-all duration-200 ${copyState === 'copied' ? '!border-green-500 !text-green-400' : ''
            }`}
        >
          {copyState === 'copying' && (
            <span className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {copyState === 'copying' && (locale === 'tr' ? 'Kopyalanıyor...' : 'Copying...')}
          {copyState === 'copied' && (locale === 'tr' ? 'Görsel Kopyalandı! 📋' : 'Image Copied! 📋')}
          {copyState === 'copy' && t('result.copy')}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HIDDEN CAPTURE CARD — USING YOUR TEMPLATE IMAGE (scoreCard.jpeg)
          ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'fixed', left: -9999, top: -9999,
        pointerEvents: 'none', zIndex: -1,
      }}>
        {/*
          Görselin tam hizalı oturması için 540x960 (9:16) boyutu korundu.
        */}
        <div ref={cardRef} style={{
          width: 540,
          height: 960,
          backgroundImage: `url(${locale === 'tr' ? '/scoreCard.jpeg' : '/scoreCardEN.jpeg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* ── OYUNUN BAŞLIĞI / ADI (Halkanın Hemen Üstü - Home Ekranı Tasarımı) ── */}
          <div style={{
            position: 'absolute',
            top: 80,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            lineHeight: 1.1
          }}>
            <span style={{
              fontFamily: 'Valorant, system-ui, sans-serif',
              fontSize: 35,
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              textShadow: '0 0 12px rgba(255,255,255,0.85), 0 2px 4px rgba(0,0,0,0.8)'
            }}>
              {t('home.title1')}
            </span>
            <span style={{
              fontFamily: 'Valorant, system-ui, sans-serif',
              fontSize: 24,
              color: '#ff4655', // Canlı Valorant Kırmızısı
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              textShadow: '0 0 10px rgba(255,70,85,0.85), 0 2px 4px rgba(0,0,0,0.8)'
            }}>
              {t('home.title2')}
            </span>
          </div>

          {/* ── DOĞRU / TOPLAM (Halkanın Tam Ortası) ── */}
          <div style={{
            position: 'absolute',
            top: 290,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
            gap: 10,
          }}>
            {/* Doğru sayısı için Yeşil/Cyan RGB parlaması */}
            <span style={{
              fontSize: 115,
              color: '#ffffff',
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              textShadow: '0 0 12px #22c55e, 0 0 25px #22c55e, 0 0 50px rgba(34,197,94,0.6)'
            }}>{correct}</span>
            <span style={{
              fontSize: 75,
              color: '#ffffff',
              margin: '0 6px',
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              textShadow: '0 0 10px #ffffff, 0 0 20px rgba(255,255,255,0.6)'
            }}>/</span>
            {/* Toplam sayısı için Kırmızı/Pembe RGB parlaması */}
            <span style={{
              fontSize: 115,
              color: '#ffffff',
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              textShadow: '0 0 12px #FF4655, 0 0 25px #FF4655, 0 0 50px rgba(255,70,85,0.6)'
            }}>{total}</span>
          </div>

          {/* ── TEBRİKLER METNİ (Halkanın Alt Kısmı) ── */}
          <div style={{
            position: 'absolute',
            top: 810,
            width: '100%',
            textAlign: 'center',
            fontSize: 38,
            color: '#ffd0b0',
            textShadow: '0 4px 12px rgba(0,0,0,0.8)'
          }}>
            {getCongratsText()}
          </div>

          {/* ── DEĞİŞKEN OYUN MODU (OYUN MODU Etiketinin Altı) ── */}
          <div style={{
            position: 'absolute',
            top: 500,
            width: '100%',
            textAlign: 'center',
            fontSize: 32,
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
          }}>
            {tMode(mode)}
          </div>

          {/* ── OYUNCU NICKNAME (1. Kutunun İçi) ── */}
          <div style={{
            position: 'absolute',
            top: 650,
            width: '100%',
            textAlign: 'center',
            fontSize: 36,
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
          }}>
            {nickname || 'GİZLİ AJAN'}
          </div>

          {/* ── DEĞİŞKEN ZORLUK (2. Kutunun İçi) ── */}
          <div style={{
            position: 'absolute',
            top: 740,
            width: '100%',
            textAlign: 'center',
            fontSize: 36,
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
          }}>
            {tDifficulty(difficulty)}
          </div>

          {/* ── TOPLAM SKOR (En Alt Kısım) ── */}
          <div style={{
            position: 'absolute',
            top: 140, // Biraz daha yukarı ve daha büyük
            width: '100%',
            textAlign: 'center',
            fontSize: 52, // Boyutu ciddi oranda büyütüldü
            fontWeight: 'bold',
            letterSpacing: '0.08em',
            color: '#22d3ee', // Canlı Neon Cyan
            textShadow: '0 0 12px #22d3ee, 0 0 25px rgba(34,211,238,0.7), 0 0 50px rgba(34,211,238,0.4), 0 4px 15px rgba(0,0,0,0.9)'
          }}>
            SCORE: {score}
          </div>

          {/* ── SİTE ADRESİ (Env Değişkeninden Sağ Alt Köşe) ── */}
          {import.meta.env.VITE_SITE_URL && (
            <div style={{
              position: 'absolute',
              bottom: 45,
              right: 35,
              fontSize: 15,
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              letterSpacing: '0.12em',
              color: 'rgba(255, 255, 255, 0.45)',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}>
              {import.meta.env.VITE_SITE_URL}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
