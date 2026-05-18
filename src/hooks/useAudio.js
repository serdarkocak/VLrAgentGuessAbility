import { useCallback, useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';

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
        html5: true,
        rate,
        onplay: () => setIsPlaying(true),
        onend: () => setIsPlaying(false),
        onstop: () => setIsPlaying(false),
        onpause: () => setIsPlaying(false),
        onloaderror: () => setIsPlaying(false),
        onplayerror: () => setIsPlaying(false),
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
