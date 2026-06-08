import React from 'react';

type Props = {
  score: number; // 0..1
};

export default function ConfidenceMeter({ score }: Props) {
  const percent = Math.round(Math.max(0, Math.min(1, score)) * 100);
  const color = percent > 80 ? 'bg-success' : percent > 60 ? 'bg-warning' : 'bg-danger';

  return (
    <div>
      <div className="text-sm">Confidence: {percent}%</div>
      <div className="w-full bg-gray-200 h-3 rounded">
        <div className={`${color} h-3 rounded`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
