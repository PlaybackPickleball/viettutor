"use client";

import { useEffect, useRef } from "react";

export type KaraokeLoop = { start: number; end: number } | null;

type Props = {
  /** Stable id for effect deps (song catalog id) */
  trackId: string;
  audioUrl: string;
  /** Soft ceiling for seeks; 0 = use media duration */
  durationSec: number;
  playing: boolean;
  speed: number;
  loop: KaraokeLoop;
  onTime: (t: number) => void;
  onPlayingChange: (playing: boolean) => void;
  onDuration?: (sec: number) => void;
  onEnded?: () => void;
  seekTo?: number | null;
  seekNonce?: number;
};

/**
 * Reusable karaoke engine: HTMLAudioElement + rAF visual clock.
 * Audio.currentTime is the source of truth. Works with blob: (Dev Mode) or https.
 */
export function KaraokePlayer({
  trackId,
  audioUrl,
  durationSec,
  playing,
  speed,
  loop,
  onTime,
  onPlayingChange,
  onDuration,
  onEnded,
  seekTo,
  seekNonce = 0,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const loopRef = useRef(loop);
  const durationRef = useRef(durationSec);
  loopRef.current = loop;
  durationRef.current = durationSec;

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    const el = audio as HTMLMediaElement & {
      preservesPitch?: boolean;
      mozPreservesPitch?: boolean;
      webkitPreservesPitch?: boolean;
    };
    el.preservesPitch = true;
    el.mozPreservesPitch = true;
    el.webkitPreservesPitch = true;
    audio.playbackRate = speed;
    audioRef.current = audio;

    const tick = () => {
      const a = audioRef.current;
      if (!a) return;
      const cur = a.currentTime;
      const lp = loopRef.current;
      if (lp && cur >= lp.end) {
        a.currentTime = lp.start;
      }
      onTime(a.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    };

    const onPlay = () => {
      onPlayingChange(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    const onPause = () => {
      onPlayingChange(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      onTime(audio.currentTime);
    };
    const onSeeked = () => onTime(audio.currentTime);
    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        onDuration?.(audio.duration);
        durationRef.current = audio.duration;
      }
    };
    const onEnd = () => {
      onPlayingChange(false);
      onEnded?.();
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("seeked", onSeeked);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("seeked", onSeeked);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, trackId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      void audio.play().catch(() => onPlayingChange(false));
    } else {
      audio.pause();
    }
  }, [playing, onPlayingChange]);

  useEffect(() => {
    if (seekTo == null || Number.isNaN(seekTo)) return;
    const audio = audioRef.current;
    if (!audio) return;
    const max = durationRef.current || audio.duration || 0;
    audio.currentTime = Math.max(0, max > 0 ? Math.min(max, seekTo) : seekTo);
    onTime(audio.currentTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekTo, seekNonce, trackId]);

  return null;
}

export function formatKaraokeTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
