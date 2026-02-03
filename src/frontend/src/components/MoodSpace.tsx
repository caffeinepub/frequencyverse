import { useState } from 'react';
import { moods, MoodType } from '../lib/moods';
import { moodRecommendations } from '../lib/moodRecommendations';
import { useLanguage } from '../hooks/useLanguage';
import RecommendedSounds from './RecommendedSounds';

export default function MoodSpace() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const { t } = useLanguage();

  const handleMoodSelect = (moodId: MoodType) => {
    setSelectedMood(moodId);
  };

  const recommendations = selectedMood ? moodRecommendations[selectedMood] : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 text-center drop-shadow-lg">
          {t.moodSpace.title}
        </h2>
        <p className="text-white/80 text-center mb-6 drop-shadow-md">
          {t.moodSpace.subtitle}
        </p>

        {/* Mood Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6 mb-8">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-2xl
                transition-all duration-300 transform hover:scale-105
                ${selectedMood === mood.id 
                  ? 'bg-white/20 backdrop-blur-md ring-2 ring-white/50 scale-105' 
                  : 'bg-white/10 backdrop-blur-sm hover:bg-white/15'
                }
              `}
              style={{
                boxShadow: selectedMood === mood.id 
                  ? `0 0 30px ${mood.glowColor}, 0 0 60px ${mood.glowColor}` 
                  : `0 0 15px ${mood.glowColor}`,
              }}
            >
              <div 
                className="w-16 h-16 rounded-full mb-3 flex items-center justify-center overflow-hidden"
                style={{
                  boxShadow: `0 0 20px ${mood.glowColor}, inset 0 0 20px ${mood.glowColor}`,
                  background: `radial-gradient(circle, ${mood.glowColor} 0%, transparent 70%)`,
                }}
              >
                <img 
                  src={mood.icon} 
                  alt={t.moodSpace.moods[mood.id]}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <span className="text-white font-semibold text-sm text-center drop-shadow-md">
                {t.moodSpace.moods[mood.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Sounds Section */}
      {selectedMood && (
        <RecommendedSounds 
          recommendations={recommendations}
          moodType={selectedMood}
        />
      )}
    </div>
  );
}
