import { useCallback, useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';

// Minimal silent WAV — unlocks Web Audio on first user gesture
const SILENT_SRC =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

let unlockHowl = null;

export function unlockAudioPlayback() {
  if (typeof window === 'undefined') return;

  const ctx = Howler.ctx;
  if (ctx?.state === 'suspended') {
    void ctx.resume();
  }

  if (!unlockHowl) {
    unlockHowl = new Howl({ src: [SILENT_SRC], volume: 0.001 });
  }
  unlockHowl.play();
}

export function useAudio() {
  const howlRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);

  const unload = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(
    (src, { rate = 1 } = {}) => {
      unload();
      setCurrentSrc(src);

      const howl = new Howl({
        src: [src],
        rate,
        onplay: () => setIsPlaying(true),
        onend: () => setIsPlaying(false),
        onstop: () => setIsPlaying(false),
        onpause: () => setIsPlaying(false),
        onloaderror: () => setIsPlaying(false),
        onplayerror: (_id, err) => {
          setIsPlaying(false);
          console.warn('Audio play failed:', err);
        },
      });

      howlRef.current = howl;
      howl.play();
    },
    [unload],
  );

  const replay = useCallback(
    (rate = 1) => {
      if (!currentSrc) return;
      play(currentSrc, { rate });
    },
    [currentSrc, play],
  );

  const playSlow = useCallback(() => {
    replay(0.7);
  }, [replay]);

  const stop = useCallback(() => {
    if (howlRef.current) howlRef.current.stop();
    setIsPlaying(false);
  }, []);

  useEffect(() => () => unload(), [unload]);

  return { play, replay, playSlow, stop, isPlaying, currentSrc, unload };
}
