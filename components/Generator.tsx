'use client';

import { useState, useRef, useEffect } from 'react';
import { getRandomVibe } from '@/lib/utils';
import LoadingOrb from '@/components/LoadingOrb';

type RoutinePhase = 'idle' | 'loading';
type RoutineMode = 'still-point' | 'frequency-stack';

interface GeneratorProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  phase?: RoutinePhase;
}

const STILL_POINT_CHIPS = [
  'rain on a warm car',
  'cold marble',
  'bass in an empty room',
  'cigarette smoke at 2am',
  'dried roses',
  'heavy silk',
];

const ENERGY_OPTIONS = [
  'slow',
  'charged',
  'heavy',
  'electric',
  'quiet',
  'expansive',
  'grounded',
  'volatile',
];

const TEXTURE_OPTIONS = [
  'silk',
  'concrete',
  'smoke',
  'glass',
  'velvet',
  'iron',
  'water',
  'flame',
];

const INTENTION_OPTIONS = [
  'arrive',
  'disappear',
  'ignite',
  'dissolve',
  'command',
  'drift',
  'sharpen',
  'soften',
];

interface FrequencyLayerProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  disabled: boolean;
}

function FrequencyLayer({
  label,
  options,
  selected,
  onSelect,
  disabled,
}: FrequencyLayerProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.56rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: 8,
          opacity: 0.78,
        }}
      >
        {label}
      </p>
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}
      >
        {options.map((option) => {
          const isActive = selected === option;
          return (
            <button
              key={option}
              onClick={() => onSelect(option)}
              disabled={disabled}
              style={{
                borderRadius: 999,
                border: `1px solid ${isActive ? 'var(--border-gold)' : 'var(--border)'}`,
                background: isActive
                  ? 'rgba(196, 164, 107, 0.12)'
                  : 'rgba(255,255,255,0.02)',
                color: isActive ? 'var(--gold-light)' : 'var(--text-secondary)',
                padding: '8px 12px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                lineHeight: 1.2,
                fontWeight: 300,
                textTransform: 'capitalize',
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                opacity: disabled ? 0.45 : 1,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isActive) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'var(--border-gold)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'var(--gold-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (isActive) return;
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  'var(--border)';
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--text-secondary)';
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildFrequencyPrompt(energy: string, texture: string, intention: string) {
  return `Generate an aura with this energy: ${energy}. This texture: ${texture}. This intention: ${intention}.`;
}

export default function Generator({
  onGenerate,
  isLoading,
  phase = 'idle',
}: GeneratorProps) {
  const [mode, setMode] = useState<RoutineMode>('still-point');
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [energy, setEnergy] = useState('');
  const [texture, setTexture] = useState('');
  const [intention, setIntention] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isRoutineLoading = phase === 'loading';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  function handleSubmit() {
    if (isLoading) return;

    if (mode === 'still-point') {
      const trimmed = prompt.trim();
      if (!trimmed) return;
      onGenerate(trimmed);
      return;
    }

    if (!energy || !texture || !intention) return;
    onGenerate(buildFrequencyPrompt(energy, texture, intention));
  }

  function handleQuickVibe() {
    if (isLoading) return;
    const vibe = getRandomVibe();
    setPrompt(vibe);
    onGenerate(vibe);
  }

  function handleChipSelect(chip: string) {
    if (isLoading) return;
    setPrompt(chip);
    textareaRef.current?.focus();
  }

  function handleModeSwitch(nextMode: RoutineMode) {
    if (isLoading) return;
    setMode(nextMode);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const hasCompleteFrequencyStack = Boolean(energy && texture && intention);
  const canGenerate =
    mode === 'still-point' ? Boolean(prompt.trim()) : hasCompleteFrequencyStack;
  const frequencyPreview = hasCompleteFrequencyStack
    ? `${energy} • ${texture} • ${intention}`
    : null;

  return (
    <section
      style={{
        width: '100%',
        animation: 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      }}
    >
      <div
        style={{
          marginBottom: 14,
          opacity: isRoutineLoading ? 0.42 : 1,
          transform: isRoutineLoading ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            opacity: 0.72,
            marginBottom: 10,
          }}
        >
          {mode === 'still-point' ? 'Still Point Routine' : 'Frequency Stack Routine'}
        </p>
        <p
          className="font-display"
          style={{
            fontSize: 'clamp(1.08rem, 4.4vw, 1.35rem)',
            fontStyle: 'italic',
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            fontWeight: 400,
            letterSpacing: '0.01em',
          }}
        >
          {mode === 'still-point'
            ? 'Name something you could see, hear, or feel right now that matches your energy.'
            : 'Choose the three layers that best match your current frequency.'}
        </p>
      </div>

      <nav
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 12,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 100,
          padding: 4,
          opacity: isRoutineLoading ? 0.28 : 1,
          transform: isRoutineLoading ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          pointerEvents: isRoutineLoading ? 'none' : 'auto',
        }}
      >
        {(['still-point', 'frequency-stack'] as RoutineMode[]).map((option) => {
          const active = mode === option;
          return (
            <button
              key={option}
              onClick={() => handleModeSwitch(option)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.58rem',
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                transition: 'all 0.25s var(--transition)',
                background: active ? 'rgba(196, 164, 107, 0.12)' : 'transparent',
                color: active ? 'var(--gold)' : 'var(--text-tertiary)',
              }}
            >
              {option === 'still-point' ? 'Still Point' : 'Frequency Stack'}
            </button>
          );
        })}
      </nav>

      {/* Routine input area */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${isFocused ? 'var(--border-gold)' : 'var(--border)'}`,
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.02) 100%)',
          transition:
            'border-color 0.3s ease, box-shadow 0.3s ease, min-height 0.35s ease',
          boxShadow: isFocused
            ? '0 0 0 3px rgba(196, 164, 107, 0.05), 0 18px 40px rgba(0,0,0,0.46)'
            : '0 12px 28px rgba(0,0,0,0.34)',
          overflow: 'hidden',
          minHeight: mode === 'frequency-stack' ? 332 : isRoutineLoading ? 234 : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse at top left, rgba(196, 164, 107, 0.08) 0%, transparent 60%)',
            opacity: isFocused ? 1 : 0.65,
            transition: 'opacity 0.3s ease',
          }}
        />

        {mode === 'still-point' ? (
          <div>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="rain on warm concrete after midnight..."
              rows={2}
              disabled={isLoading}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: '20px 20px 12px',
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                fontWeight: 300,
                color: 'var(--text-primary)',
                lineHeight: 1.6,
                minHeight: 88,
                maxHeight: 220,
                overflowY: 'auto',
                caretColor: 'var(--gold)',
                letterSpacing: '0.01em',
              }}
              aria-label="Still Point routine prompt"
            />

            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                padding: '0 20px 16px',
                opacity: isRoutineLoading ? 0.2 : 1,
                transform: isRoutineLoading ? 'translateY(6px)' : 'translateY(0)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.54rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  opacity: 0.8,
                }}
              >
                Enter to generate
              </p>
              <button
                onClick={handleSubmit}
                disabled={!canGenerate || isLoading}
                aria-label="Generate"
                style={{
                  minWidth: 124,
                  height: 38,
                  borderRadius: 999,
                  background: !canGenerate || isLoading ? 'var(--black-4)' : 'var(--gold)',
                  border: 'none',
                  cursor: !canGenerate || isLoading ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s ease, transform 0.15s ease, opacity 0.2s ease',
                  flexShrink: 0,
                  color: !canGenerate || isLoading ? 'var(--text-tertiary)' : '#0a0a0a',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  opacity: isLoading ? 0.75 : 1,
                }}
                onMouseEnter={(e) => {
                  if (canGenerate && !isLoading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                {isLoading ? (
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: '1.5px solid rgba(10,10,10,0.3)',
                      borderTopColor: '#0a0a0a',
                      animation: 'spin 0.7s linear infinite',
                      display: 'block',
                    }}
                  />
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '16px 14px 14px',
              opacity: isRoutineLoading ? 0.2 : 1,
              transform: isRoutineLoading ? 'translateY(6px)' : 'translateY(0)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            <FrequencyLayer
              label="Energy"
              options={ENERGY_OPTIONS}
              selected={energy}
              onSelect={setEnergy}
              disabled={isLoading}
            />
            <FrequencyLayer
              label="Texture"
              options={TEXTURE_OPTIONS}
              selected={texture}
              onSelect={setTexture}
              disabled={isLoading}
            />
            <FrequencyLayer
              label="Intention"
              options={INTENTION_OPTIONS}
              selected={intention}
              onSelect={setIntention}
              disabled={isLoading}
            />

            <div
              style={{
                marginTop: 2,
                marginBottom: 10,
                minHeight: 26,
                padding: '7px 10px',
                borderRadius: 10,
                border: `1px solid ${
                  frequencyPreview ? 'var(--border-gold)' : 'rgba(255,255,255,0.04)'
                }`,
                background: frequencyPreview
                  ? 'rgba(196, 164, 107, 0.06)'
                  : 'rgba(255,255,255,0.015)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.56rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: frequencyPreview ? 'var(--gold-light)' : 'var(--text-tertiary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {frequencyPreview || 'Select one from each layer'}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.54rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  opacity: 0.8,
                }}
              >
                Select all three layers
              </p>
              <button
                onClick={handleSubmit}
                disabled={!canGenerate || isLoading}
                aria-label="Generate"
                style={{
                  minWidth: 124,
                  height: 38,
                  borderRadius: 999,
                  background: !canGenerate || isLoading ? 'var(--black-4)' : 'var(--gold)',
                  border: 'none',
                  cursor: !canGenerate || isLoading ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s ease, transform 0.15s ease, opacity 0.2s ease',
                  flexShrink: 0,
                  color: !canGenerate || isLoading ? 'var(--text-tertiary)' : '#0a0a0a',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  opacity: isLoading ? 0.75 : 1,
                }}
                onMouseEnter={(e) => {
                  if (canGenerate && !isLoading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                {isLoading ? (
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: '1.5px solid rgba(10,10,10,0.3)',
                      borderTopColor: '#0a0a0a',
                      animation: 'spin 0.7s linear infinite',
                      display: 'block',
                    }}
                  />
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        )}

        {isRoutineLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 4,
              background:
                'linear-gradient(180deg, rgba(8,8,8,0.74) 0%, rgba(8,8,8,0.86) 100%)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeIn 0.35s ease forwards',
            }}
          >
            <LoadingOrb compact />
          </div>
        )}
      </div>

      {mode === 'still-point' ? (
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            animation: 'fadeIn 0.7s 0.15s ease both',
            opacity: isRoutineLoading ? 0.16 : 1,
            transform: isRoutineLoading ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            pointerEvents: isRoutineLoading ? 'none' : 'auto',
          }}
        >
          {STILL_POINT_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipSelect(chip)}
              disabled={isLoading}
              style={{
                borderRadius: 999,
                border: `1px solid ${prompt === chip ? 'var(--border-gold)' : 'var(--border)'}`,
                background:
                  prompt === chip ? 'rgba(196, 164, 107, 0.08)' : 'rgba(255,255,255,0.02)',
                color: prompt === chip ? 'var(--gold-light)' : 'var(--text-secondary)',
                padding: '8px 12px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                lineHeight: 1.2,
                fontWeight: 300,
                cursor: isLoading ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.45 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'var(--border-gold)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (prompt === chip) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'var(--border-gold)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold-light)';
                  return;
                }
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 14,
          display: 'flex',
          justifyContent: 'flex-end',
          opacity: isRoutineLoading ? 0.12 : 1,
          transform: isRoutineLoading ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          pointerEvents: isRoutineLoading ? 'none' : 'auto',
        }}
      >
        <button
          onClick={handleQuickVibe}
          disabled={isLoading}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 100,
            padding: '8px 14px',
            cursor: isLoading ? 'default' : 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.57rem',
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.35 : 0.72,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--border-gold)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)';
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <path d="M14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11l-4-7 4-7z" />
          </svg>
          Quick Vibe
        </button>
      </div>
    </section>
  );
}
