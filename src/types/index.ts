export interface GpxTrack {
  id: string;
  name: string;
  coordinates: [number, number][];
  elevations?: (number | undefined)[];
  elevationProfile?: { distance: number; elevation: number }[];
  duration?: number; // in minutes
  elevationGain?: number; // in meters
  elevationLoss?: number; // in meters
  elevationRange?: number; // in meters (max - min elevation)
  distance?: number; // in kilometers
  color: string;
  file: File;
  visible: boolean; // 控制軌跡是否可見
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    trackDefault: string;
    trackHover: string;
    trackFocus: string;
  };
}

export interface AppState {
  tracks: GpxTrack[];
  hoveredTrack: string | null;
  focusedTrack: string | null;
  theme: Theme;
}