export interface KidsSleepSound {
  id: string;
  title: string;
  category: 'whiteNoise' | 'natureSounds' | 'lullabies' | 'fairyTale';
}

export const kidsSleepSounds: KidsSleepSound[] = [
  // White & Steady Noises
  { id: 'white-noise', title: 'whiteNoise', category: 'whiteNoise' },
  { id: 'pink-noise', title: 'pinkNoise', category: 'whiteNoise' },
  { id: 'brown-noise', title: 'brownNoise', category: 'whiteNoise' },
  { id: 'womb-sound', title: 'wombSound', category: 'whiteNoise' },
  { id: 'heartbeat', title: 'heartbeat', category: 'whiteNoise' },
  { id: 'fan-ac', title: 'fanAC', category: 'whiteNoise' },
  
  // Nature Sounds
  { id: 'light-rain', title: 'lightRain', category: 'natureSounds' },
  { id: 'ocean-waves', title: 'oceanWaves', category: 'natureSounds' },
  { id: 'forest-night', title: 'forestNight', category: 'natureSounds' },
  { id: 'wind-leaves', title: 'windLeaves', category: 'natureSounds' },
  { id: 'stream-water', title: 'streamWater', category: 'natureSounds' },
  { id: 'distant-thunder', title: 'distantThunder', category: 'natureSounds' },
  
  // Lullabies & Musical
  { id: 'kalimba-lullaby', title: 'kalimbaLullaby', category: 'lullabies' },
  { id: 'harp-lullaby', title: 'harpLullaby', category: 'lullabies' },
  { id: 'music-box', title: 'musicBox', category: 'lullabies' },
  { id: 'slow-instrumental', title: 'slowInstrumental', category: 'lullabies' },
  
  // Fairy-tale & Ambient
  { id: 'starry-night', title: 'starryNight', category: 'fairyTale' },
  { id: 'space-ambience', title: 'spaceAmbience', category: 'fairyTale' },
  { id: 'calm-campfire', title: 'calmCampfire', category: 'fairyTale' },
  { id: 'night-train', title: 'nightTrain', category: 'fairyTale' },
];
