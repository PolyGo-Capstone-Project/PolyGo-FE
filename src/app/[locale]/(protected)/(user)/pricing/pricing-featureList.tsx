"use client";

export default function FeaturesList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 sm:space-y-4">
      {items.map((text, idx) => (
        <li key={idx} className="flex gap-2 sm:gap-3 text-sm sm:text-base">
          <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
          <span className="leading-relaxed text-foreground">{text}</span>
        </li>
      ))}
    </ul>
  );
}
