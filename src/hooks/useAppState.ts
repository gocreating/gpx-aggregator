import { useState, useCallback } from 'react';
import { AppState, GpxTrack, Theme } from '../types';
import { darkTheme } from '../themes';

export function useAppState() {
  const [state, setState] = useState<AppState>({
    tracks: [],
    hoveredTrack: null,
    focusedTrack: null,
    theme: darkTheme,
  });

  const setTracks = useCallback((tracks: GpxTrack[]) => {
    setState(prev => ({ ...prev, tracks }));
  }, []);

  const addTracks = useCallback((newTracks: GpxTrack[]) => {
    setState(prev => ({ ...prev, tracks: [...prev.tracks, ...newTracks] }));
  }, []);

  const setHoveredTrack = useCallback((trackId: string | null) => {
    setState(prev => ({ ...prev, hoveredTrack: trackId }));
  }, []);

  const setFocusedTrack = useCallback((trackId: string | null) => {
    setState(prev => ({ ...prev, focusedTrack: trackId }));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
  }, []);

  const removeTrack = useCallback((trackId: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.filter(track => track.id !== trackId),
      hoveredTrack: prev.hoveredTrack === trackId ? null : prev.hoveredTrack,
      focusedTrack: prev.focusedTrack === trackId ? null : prev.focusedTrack,
    }));
  }, []);

  const toggleTrackVisibility = useCallback((trackId: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => 
        track.id === trackId 
          ? { ...track, visible: !track.visible }
          : track
      ),
    }));
  }, []);

  return {
    state,
    setTracks,
    addTracks,
    setHoveredTrack,
    setFocusedTrack,
    setTheme,
    removeTrack,
    toggleTrackVisibility,
  };
}