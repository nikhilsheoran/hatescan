interface ScoreIndicatorProps {
  score: number;
}

export default function ScoreIndicator({ score }: ScoreIndicatorProps) {
  const gradient = `linear-gradient(to right, green, yellow, orange, red ${
    score * 100
  }%)`;

  return (
    <div className="w-full">
      <div className="w-full h-4 rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-4 rounded-full bg-gradient-to-r from-green-500 to-red-500"
          style={{ width: `${score}%`, backgroundImage: gradient }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span>0 (Safe)</span>
        <span>{score.toFixed(2)}</span>
        <span>1 (Radical)</span>
      </div>
    </div>
  );
} 