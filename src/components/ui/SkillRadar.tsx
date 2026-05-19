import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { PlayerRating } from '../../types';

interface Props {
  rating: PlayerRating;
}

export function SkillRadar({ rating }: Props) {
  const data = [
    { subject: 'السرعة', A: rating.speed, fullMark: 10 },
    { subject: 'التسديد', A: rating.shooting, fullMark: 10 },
    { subject: 'التمرير', A: rating.passing, fullMark: 10 },
    { subject: 'الدفاع', A: rating.defense, fullMark: 10 },
  ];

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          />
          <Radar
            name="Rating"
            dataKey="A"
            stroke="var(--color-brand)"
            fill="var(--color-brand)"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
