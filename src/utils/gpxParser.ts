import { GpxTrack } from '../types';

// Simple GPX parser using DOM
function parseGpxContent(content: string): {
  points: Array<{ lat: number; lon: number; ele?: number; time?: string }>;
  name?: string;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'application/xml');
  
  // Get track name
  const nameElement = doc.querySelector('trk name') || doc.querySelector('metadata name');
  const name = nameElement?.textContent || undefined;
  
  // Get track points
  const trackPoints = doc.querySelectorAll('trkpt');
  const points: Array<{ lat: number; lon: number; ele?: number; time?: string }> = [];
  
  trackPoints.forEach(trkpt => {
    const lat = parseFloat(trkpt.getAttribute('lat') || '0');
    const lon = parseFloat(trkpt.getAttribute('lon') || '0');
    const eleElement = trkpt.querySelector('ele');
    const timeElement = trkpt.querySelector('time');
    
    points.push({
      lat,
      lon,
      ele: eleElement ? parseFloat(eleElement.textContent || '0') : undefined,
      time: timeElement ? timeElement.textContent || undefined : undefined,
    });
  });
  
  return { points, name };
}

function calculateDistance(points: Array<{ lat: number; lon: number }>): number {
  let distance = 0;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (curr.lat - prev.lat) * Math.PI / 180;
    const dLon = (curr.lon - prev.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(prev.lat * Math.PI / 180) * Math.cos(curr.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance += R * c;
  }
  
  return distance;
}

function calculateElevationGain(points: Array<{ ele?: number }>): number {
  let gain = 0;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    if (prev.ele !== undefined && curr.ele !== undefined) {
      const diff = curr.ele - prev.ele;
      if (diff > 0) {
        gain += diff;
      }
    }
  }
  
  return gain;
}

function calculateElevationLoss(points: Array<{ ele?: number }>): number {
  let loss = 0;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    if (prev.ele !== undefined && curr.ele !== undefined) {
      const diff = curr.ele - prev.ele;
      if (diff < 0) {
        loss += Math.abs(diff);
      }
    }
  }
  
  return loss;
}

function calculateElevationRange(points: Array<{ ele?: number }>): number | undefined {
  const elevations = points.map(p => p.ele).filter(ele => ele !== undefined) as number[];
  
  if (elevations.length === 0) {
    return undefined;
  }
  
  const minElevation = Math.min(...elevations);
  const maxElevation = Math.max(...elevations);
  
  return maxElevation - minElevation;
}

function calculateDuration(points: Array<{ time?: string }>): number | undefined {
  const firstPoint = points.find(p => p.time);
  const lastPoint = points.slice().reverse().find(p => p.time);
  
  if (!firstPoint?.time || !lastPoint?.time) {
    return undefined;
  }
  
  const start = new Date(firstPoint.time);
  const end = new Date(lastPoint.time);
  
  return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
}

function calculateElevationProfile(points: Array<{ lat: number; lon: number; ele?: number }>): { distance: number; elevation: number }[] {
  let total = 0;
  const profile: { distance: number; elevation: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    if (i > 0) {
      const prev = points[i - 1];
      const curr = points[i];
      // Haversine formula
      const R = 6371;
      const dLat = (curr.lat - prev.lat) * Math.PI / 180;
      const dLon = (curr.lon - prev.lon) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(prev.lat * Math.PI / 180) * Math.cos(curr.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    if (typeof points[i].ele === 'number') {
      profile.push({ distance: total, elevation: points[i].ele! });
    }
  }
  return profile;
}

function generateTrackColor(_index: number): string {
  // 返回佔位符，實際顏色在 Map 組件中使用主題顏色
  return 'theme-default';
}

export async function parseGpxFile(file: File, index: number): Promise<GpxTrack> {
  const content = await file.text();
  const { points, name } = parseGpxContent(content);
  
  if (points.length === 0) {
    throw new Error('No track points found in GPX file');
  }
  
  const coordinates: [number, number][] = points.map(p => [p.lat, p.lon]);
  const elevations: (number | undefined)[] = points.map(p => p.ele);
  const elevationProfile = calculateElevationProfile(points);
  const distance = calculateDistance(points);
  const elevationGain = calculateElevationGain(points);
  const elevationLoss = calculateElevationLoss(points);
  const elevationRange = calculateElevationRange(points);
  const duration = calculateDuration(points);
  
  return {
    id: `${file.name}-${Date.now()}`,
    name: name || file.name.replace('.gpx', ''),
    coordinates,
    elevations,
    elevationProfile,
    duration,
    elevationGain,
    elevationLoss,
    elevationRange,
    distance,
    color: generateTrackColor(index),
    file,
    visible: true, // 預設為可見
  };
}

export async function parseGpxFiles(files: FileList): Promise<GpxTrack[]> {
  const gpxFiles = Array.from(files).filter(file => 
    file.name.toLowerCase().endsWith('.gpx')
  );
  
  const tracks = await Promise.all(
    gpxFiles.map((file, index) => parseGpxFile(file, index))
  );
  
  return tracks;
}