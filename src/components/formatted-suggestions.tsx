import React from 'react';
import { cn } from '@/lib/utils';

interface FormattedSuggestionsProps {
  suggestions: string;
}

const parseSuggestions = (text: string) => {
  // Split the intro from the main points
  const [intro, ...rest] = text.split(/\d+\.\s/);
  const mainPointsText = rest.join('');
  const mainPoints = mainPointsText.split(/(\d+\.)/).filter(Boolean);

  let structuredPoints: { title: string; text: string; subPoints: { title: string; text: string }[] }[] = [];
  
  // This logic is fragile and depends on the LLM response format.
  // It iterates through the main points and their sub-points.
  const pointsAndSubpoints = text.split(/\d+\.\s\*\*/);

  if (pointsAndSubpoints.length > 1) {
    const intro = pointsAndSubpoints[0];
    const rest = pointsAndSubpoints.slice(1);
    
    structuredPoints = rest.map(pointText => {
      const [title, ...contentParts] = pointText.split(/:\*\*|\s\*/);
      const subPoints = contentParts.join('').split('* **').filter(sp => sp.trim()).map(subPoint => {
        const [subTitle, ...subTextParts] = subPoint.split(':**');
        return {
          title: subTitle.trim(),
          text: subTextParts.join(':**').trim().replace(/`|'/g, '"'),
        };
      });

      return {
        title: title.trim(),
        text: '',
        subPoints: subPoints
      }
    });

    return { intro: intro.trim(), points: structuredPoints };
  }


  // Fallback for a different format
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const introLine = lines.shift() || '';

  const points = lines.map(line => {
    const [title, ...content] = line.replace(/^\d+\.\s\*\*/, '').split(/:\*\*/);
    return {
      title: title.trim(),
      text: content.join(':**').trim(),
      subPoints: [] // Sub-point parsing can be added here if needed
    };
  });
  
  return { intro: introLine, points };
};


export function FormattedSuggestions({ suggestions }: FormattedSuggestionsProps) {
  const { intro, points } = parseSuggestions(suggestions);

  return (
    <div className="text-sm text-muted-foreground space-y-4">
      {intro && <p className="leading-relaxed">{intro}</p>}
      <ul className="space-y-4 list-outside pl-0">
        {points.map((point, index) => (
          <li key={index} className="space-y-2">
            <h4 className="font-semibold text-foreground text-base">{index + 1}. {point.title}</h4>
            {point.text && <p className="leading-relaxed">{point.text}</p>}
            {point.subPoints && point.subPoints.length > 0 && (
                <ul className="space-y-2 list-disc list-outside pl-5 mt-2">
                    {point.subPoints.map((sub, subIndex) => (
                        <li key={subIndex}>
                           <strong className="text-foreground">{sub.title}:</strong> {sub.text}
                        </li>
                    ))}
                </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
