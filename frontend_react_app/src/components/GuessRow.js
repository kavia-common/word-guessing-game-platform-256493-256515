/**
 * GuessRow renders a single guess with per-letter feedback:
 * - correct: green
 * - present: orange
 * - absent: gray
 */
import React from 'react';

// PUBLIC_INTERFACE
export default function GuessRow({ letters = [], feedback = [] }) {
  return (
    <div className="guess-row" role="listitem" aria-label="Guess result">
      {letters.map((ch, idx) => {
        const state = feedback[idx] || 'absent';
        return (
          <span
            key={`${idx}-${ch}`}
            className={`tile tile-${state}`}
            aria-label={`Letter ${ch || ''} is ${state}`}
          >
            {ch ? ch.toUpperCase() : ''}
          </span>
        );
      })}
    </div>
  );
}
