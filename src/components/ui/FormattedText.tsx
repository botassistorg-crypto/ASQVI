/**
 * Renders text with proper formatting:
 * - Line breaks (\n) preserved
 * - Lines starting with • or - or * rendered as bullet points
 * - Empty lines create spacing
 * - Whitespace preserved exactly as typed
 */

interface FormattedTextProps {
  text: string;
  className?: string;
}

export default function FormattedText({ text, className = '' }: FormattedTextProps) {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className={className}>
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Empty line = spacer
        if (trimmed === '') {
          return <div key={i} className="h-3" />;
        }

        // Bullet point line (starts with •, -, *, ►, ✓, ✔, ✅, →)
        const bulletMatch = trimmed.match(/^([•\-\*►✓✔✅→⭐🔹🔸▸▹●○◆◇])\s*(.*)/);
        if (bulletMatch) {
          return (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <span className="text-forest-green shrink-0 mt-0.5">•</span>
              <span>{bulletMatch[2]}</span>
            </div>
          );
        }

        // Numbered line (starts with 1. 2. etc)
        const numberMatch = trimmed.match(/^(\d+)[.)]\s*(.*)/);
        if (numberMatch) {
          return (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <span className="text-forest-green font-semibold shrink-0 min-w-[1.2rem]">{numberMatch[1]}.</span>
              <span>{numberMatch[2]}</span>
            </div>
          );
        }

        // Heading-like line (ALL CAPS or ends with :)
        if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 60 && !/\d/.test(trimmed)) {
          return (
            <p key={i} className="font-semibold text-text-primary mt-3 mb-1.5 text-sm uppercase tracking-wider">
              {trimmed}
            </p>
          );
        }

        if (trimmed.endsWith(':') && trimmed.length < 80) {
          return (
            <p key={i} className="font-semibold text-text-primary mt-3 mb-1.5">
              {trimmed}
            </p>
          );
        }

        // Regular paragraph line
        return (
          <p key={i} className="mb-1.5">
            {line}
          </p>
        );
      })}
    </div>
  );
}
