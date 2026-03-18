'use client';

import { useState } from 'react';
import type { FXState } from './BagViewer';
import styles from './BagViewer.module.css';

interface FXControlsProps {
  fx: FXState;
  onToggle: (key: keyof FXState) => void;
  onValue: (key: keyof FXState, value: number) => void;
}

interface ToggleRow {
  key: keyof FXState;
  label: string;
  sliders?: Array<{
    key: keyof FXState;
    label: string;
    min: number;
    max: number;
    step: number;
  }>;
}

const FX_ROWS: ToggleRow[] = [
  {
    key: 'bloom',
    label: 'Bloom',
    sliders: [
      { key: 'bloomIntensity', label: 'Intensity', min: 0, max: 3, step: 0.05 },
    ],
  },
  {
    key: 'dof',
    label: 'Depth of Field',
    sliders: [
      { key: 'dofFocusDistance', label: 'Focus', min: 0, max: 0.1, step: 0.001 },
      { key: 'dofBokehScale', label: 'Bokeh', min: 0, max: 8, step: 0.25 },
    ],
  },
  {
    key: 'colorGrading',
    label: 'Color Grading',
    sliders: [
      { key: 'exposure', label: 'Exposure', min: 0.5, max: 2, step: 0.01 },
      { key: 'saturation', label: 'Saturation', min: 0, max: 2, step: 0.01 },
    ],
  },
];

export default function FXControls({ fx, onToggle, onValue }: FXControlsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={`${styles.fxTrigger} ${open ? styles.fxTriggerOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Post-processing controls"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Post FX
      </button>

      <div
        className={`${styles.fxPanel} ${open ? styles.fxPanelVisible : ''}`}
        role="region"
        aria-label="Post FX settings"
      >
        <div className={styles.fxPanelHeader}>Post Processing</div>

        {FX_ROWS.map(({ key, label, sliders }) => (
          <div key={key} className={styles.fxGroup}>
            {/* Toggle row */}
            <div
              className={styles.fxToggleRow}
              onClick={() => onToggle(key)}
              role="switch"
              aria-checked={fx[key] as boolean}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onToggle(key)}
            >
              <span className={styles.fxLabel}>{label}</span>
              <div className={`${styles.toggleSwitch} ${fx[key] ? styles.toggleOn : ''}`}>
                <div className={styles.toggleKnob} />
              </div>
            </div>

            {/* Sliders (only if effect is on) */}
            {fx[key] && sliders?.map((slider) => (
              <div key={slider.key} className={styles.fxSliderRow}>
                <label className={styles.sliderLabel}>
                  <span>{slider.label}</span>
                  <span className={styles.sliderValue}>
                    {(fx[slider.key] as number).toFixed(2)}
                  </span>
                </label>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={fx[slider.key] as number}
                  onChange={(e) => onValue(slider.key, parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}