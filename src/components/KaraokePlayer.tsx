"use client";

import { useEffect, useRef } from "react";
import type { SingSong } from "@/lib/sing/types";
import { clampTime } from "@/lib/sing/timing";

export type KaraokeLoop = { start: number; end: number } | null;

type Props = {
  song: SingSong;
  audioUrl: string;
  playing: boolean;
  speed: number;
  loop: KaraokeLoop;
  onTime: (t: number) => void;
  onPlayingChange: (playing: boolean) => void;
  onEnded?: () => void;
  /** Imperative seek target. Bump `seekNonce` when seeking to the same second again. */
  seekTo?: number | null;
  seekNonce?: number;
};

/**
 * Reusable karaoke engine: HTMLAudioElement + rAF visual clock.
 * Audio.currentTime is the source of truth; rAF only samples it while playing.
 */
export function KaraokePlayer({
  song,
  audioUrl,
  playing,
  speed,
  loop,
  onTime,
  onPlayingChange,
  onEnded,
  seekTo,
  seekNonce = 0,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const loopRef = useRef(loop);
  loopRef.current = loop;

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
    const onEnd = () => {
      onPlayingChange(false);
      onEnded?.();
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("seeked", onSeeked);
    audio.addEventListener("ended", onEnd);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("seeked", onSeeked);
      audio.removeEventListener("ended", onEnd);
      audioRef.current = null;
    };
    // Recreate only when the authorized URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, song.id]);

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
    audio.currentTime = clampTime(song, seekTo);
    onTime(audio.currentTime);
    // seekNonce allows re-seeking the same timestamp
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekTo, seekNonce, song.id]);

  return null;
}

export function formatKaraokeTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
