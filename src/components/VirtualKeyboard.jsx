import React, { useState, useEffect } from 'react';
import { K742B_CONFIG } from '../services/k742bLayout';
import { isKeyActive } from '../services/domKeyMap';
import { Layers, Eye, Volume2, RotateCw, RotateCcw } from 'lucide-react';

const UNIT_SIZE = 44; // px per keyboard unit
const MIN_X = -2.03;
const MIN_Y = -0.27;

export function VirtualKeyboard({ 
  currentLayer, 
  setCurrentLayer, 
  selectedKey, 
  setSelectedKey, 
  pressedKeyCodes = new Set(),
  rgbMode = 1,
  rgbColor = '#e53e3e',
  onKnobTurn,
  keyLabelsMap = {}
}) {
  const [viewMode, setViewMode] = useState('vector'); // 'vector' | 'photo'
  const [knobRotation, setKnobRotation] = useState(0);

  const keys = K742B_CONFIG.layouts.keys;

  // Listen to physical knob turning via DOM multimedia events
  useEffect(() => {
    if (pressedKeyCodes.has('AudioVolumeUp')) {
      setKnobRotation(r => r + 15);
      if (onKnobTurn) onKnobTurn('clockwise');
    } else if (pressedKeyCodes.has('AudioVolumeDown')) {
      setKnobRotation(r => r - 15);
      if (onKnobTurn) onKnobTurn('counter_clockwise');
    }
  }, [pressedKeyCodes, onKnobTurn]);

  const handleKnobAction = (action) => {
    if (action === 'cw') {
      setKnobRotation(r => r + 15);
      if (onKnobTurn) onKnobTurn('clockwise');
    } else if (action === 'ccw') {
      setKnobRotation(r => r - 15);
      if (onKnobTurn) onKnobTurn('counter_clockwise');
    } else {
      if (onKnobTurn) onKnobTurn('mute');
    }
  };

  return (
    <div className="glass-panel keyboard-stage">
      <div className="keyboard-stage-header">
        {/* Layer Switcher */}
        <div className="layer-indicator-group">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>CAMADA:</span>
          <button 
            className={`layer-chip ${currentLayer === 0 ? 'active' : ''}`}
            onClick={() => setCurrentLayer(0)}
          >
            0 (Principal)
          </button>
          <button 
            className={`layer-chip ${currentLayer === 1 ? 'active' : ''}`}
            onClick={() => setCurrentLayer(1)}
          >
            1 (Fn Layer)
          </button>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn btn-secondary ${viewMode === 'vector' ? 'active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setViewMode('vector')}
          >
            <Eye size={14} /> Modo Interativo
          </button>
          <button 
            className={`btn btn-secondary ${viewMode === 'photo' ? 'active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setViewMode('photo')}
          >
            Foto K742B
          </button>
        </div>
      </div>

      {viewMode === 'photo' ? (
        <div style={{ position: 'relative', maxWidth: '840px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <img 
            src="./images/13357_58556_K742B.png" 
            alt="Redragon K742B Arlokks" 
            style={{ width: '100%', height: 'auto', borderRadius: '12px', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))' }}
          />
        </div>
      ) : (
        <div className="keyboard-chassis">
          <div 
            className="keys-grid-container"
            style={{ 
              width: `${(18.25 - MIN_X) * UNIT_SIZE}px`, 
              height: `${(6.6 - MIN_Y) * UNIT_SIZE}px` 
            }}
          >
            {keys.map((key, index) => {
              const left = (key.x - MIN_X) * UNIT_SIZE;
              const top = (key.y - MIN_Y) * UNIT_SIZE;
              const width = (key.w || 1) * UNIT_SIZE - 4;
              const height = (key.h || 1) * UNIT_SIZE - 4;

              const isSelected = selectedKey?.index === index;
              const isPressed = isKeyActive(key, pressedKeyCodes);

              // Check if it's the rotary knob (ei: 0)
              if (key.ei !== undefined) {
                const isKnobPressed = isPressed || 
                  pressedKeyCodes.has('AudioVolumeMute') || 
                  pressedKeyCodes.has('AudioVolumeUp') || 
                  pressedKeyCodes.has('AudioVolumeDown');

                return (
                  <div
                    key={index}
                    className={`rotary-knob ${isSelected ? 'selected' : ''} ${isKnobPressed ? 'pressed active' : ''}`}
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      transform: `rotate(${knobRotation}deg)`,
                      zIndex: 4
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      handleKnobAction(e.deltaY < 0 ? 'cw' : 'ccw');
                    }}
                    onClick={() => {
                      setSelectedKey(isSelected ? null : { index, key, label: customLabel || 'Mute' });
                      handleKnobAction('mute');
                    }}
                    title="Rotary Knob: Clique para Mute/Selecionar | Gire no mouse wheel ou botões"
                  >
                    <div className="knob-indicator" />
                    <Volume2 
                      size={16} 
                      color={isKnobPressed ? 'var(--color-emerald)' : (isSelected ? 'var(--color-cyan)' : '#94a3b8')} 
                    />
                  </div>
                );
              }

              // Dynamic label for the key
              const customLabel = keyLabelsMap[`${currentLayer}_${key.row}_${key.col}`] || key.value;

              // Check if it's the main ISO Enter key (inverted L shape)
              const isIsoEnter = (key.value === 'Enter' && (key.h > 1.5 || key.shape === 'iso-enter'));

              if (isIsoEnter) {
                const enterLeft = (12.04 - MIN_X) * UNIT_SIZE;
                const enterTop = (key.y - MIN_Y) * UNIT_SIZE;
                const enterWidth = 1.51 * UNIT_SIZE - 4;
                const enterHeight = 2.15 * UNIT_SIZE - 4;

                const isEnterSelected = isSelected;
                const isEnterPressed = isPressed;

                return (
                  <div
                    key={index}
                    className={`iso-enter-key ${isEnterSelected ? 'selected' : ''} ${isEnterPressed ? 'pressed' : ''}`}
                    style={{
                      left: `${enterLeft}px`,
                      top: `${enterTop}px`,
                      width: `${enterWidth}px`,
                      height: `${enterHeight}px`,
                      zIndex: 3
                    }}
                    onClick={() => setSelectedKey(isEnterSelected ? null : { index, key, label: customLabel })}
                    title="Enter (ISO / ABNT2 - Formato L Invertido)"
                  >
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 64 95"
                      style={{
                        overflow: 'visible',
                        filter: isEnterPressed 
                          ? 'drop-shadow(0 0 15px var(--color-emerald))' 
                          : (rgbMode > 0 ? `drop-shadow(0 2px 10px ${rgbColor}55)` : undefined)
                      }}
                    >
                      <defs>
                        <linearGradient id="enter-grad-default" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#222836" />
                          <stop offset="100%" stopColor="#171b24" />
                        </linearGradient>
                        <linearGradient id="enter-grad-hover" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2d3547" />
                          <stop offset="100%" stopColor="#1f2533" />
                        </linearGradient>
                      </defs>

                      {/* 3D Base Extrusion (matches 3px dark bottom border of regular keycaps) */}
                      <path
                        d="M 4,5 
                           L 60,5 
                           A 4 4 0 0 1 64,9 
                           L 64,90 
                           A 4 4 0 0 1 60,94 
                           L 19,94 
                           A 4 4 0 0 1 15,90 
                           L 15,50 
                           A 4 4 0 0 0 11,46 
                           L 4,46 
                           A 4 4 0 0 1 0,42 
                           L 0,9 
                           A 4 4 0 0 1 4,5 Z"
                        fill="#0d1017"
                      />

                      {/* Top Keycap Face */}
                      <path
                        d={isEnterPressed
                          ? `M 4,4 L 60,4 A 4 4 0 0 1 64,8 L 64,89 A 4 4 0 0 1 60,93 L 19,93 A 4 4 0 0 1 15,89 L 15,49 A 4 4 0 0 0 11,45 L 4,45 A 4 4 0 0 1 0,41 L 0,8 A 4 4 0 0 1 4,4 Z`
                          : `M 4,2 L 60,2 A 4 4 0 0 1 64,6 L 64,87 A 4 4 0 0 1 60,91 L 19,91 A 4 4 0 0 1 15,87 L 15,47 A 4 4 0 0 0 11,43 L 4,43 A 4 4 0 0 1 0,39 L 0,6 A 4 4 0 0 1 4,2 Z`}
                        fill={isEnterPressed 
                          ? 'var(--color-emerald)' 
                          : (isEnterSelected ? 'rgba(0, 229, 255, 0.25)' : 'url(#enter-grad-default)')}
                        stroke={isEnterSelected ? 'var(--color-cyan)' : (isEnterPressed ? 'var(--color-emerald)' : '#323b4e')}
                        strokeWidth={isEnterSelected || isEnterPressed ? 2 : 1}
                        style={{ transition: 'all 0.1s ease' }}
                      />

                      {customLabel === 'Enter' ? (
                        <g
                          stroke={isEnterPressed ? '#ffffff' : (isEnterSelected ? 'var(--color-cyan)' : '#e2e8f0')}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          transform={isEnterPressed ? 'translate(0, 2)' : undefined}
                        >
                          <path d="M 46, 53 L 46, 67 L 28, 67" />
                          <path d="M 34, 61 L 28, 67 L 34, 73" />
                        </g>
                      ) : (
                        <text
                          x="39"
                          y={isEnterPressed ? 69 : 67}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {customLabel}
                        </text>
                      )}
                    </svg>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className={`key-cap ${key.color === 'accent' ? 'color-accent' : ''} ${key.color === 'mod' ? 'color-mod' : ''} ${isSelected ? 'selected' : ''} ${isPressed ? 'pressed' : ''}`}
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    borderColor: isSelected ? 'var(--color-cyan)' : undefined,
                    boxShadow: isPressed 
                      ? '0 0 15px var(--color-emerald)' 
                      : (rgbMode > 0 ? `0 2px 8px ${rgbColor}33` : undefined)
                  }}
                  onClick={() => setSelectedKey(isSelected ? null : { index, key, label: customLabel })}
                >
                  <span style={{ fontSize: width > 50 ? '0.75rem' : '0.65rem' }}>
                    {customLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick knob helpers */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Volume2 size={13} color="var(--color-brand)" /> Controle do Knob:
            </span>
            <button 
              className={`btn btn-secondary ${pressedKeyCodes.has('AudioVolumeDown') ? 'active' : ''}`}
              style={{ 
                padding: '0.3rem 0.65rem', 
                fontSize: '0.75rem',
                borderColor: pressedKeyCodes.has('AudioVolumeDown') ? 'var(--color-emerald)' : undefined,
                color: pressedKeyCodes.has('AudioVolumeDown') ? 'var(--color-emerald)' : undefined
              }}
              onClick={() => handleKnobAction('ccw')}
              title="Girar anti-horário (Volume -)"
            >
              <RotateCcw size={12} /> Vol -
            </button>
            <button 
              className={`btn btn-secondary ${pressedKeyCodes.has('AudioVolumeMute') ? 'active' : ''}`}
              style={{ 
                padding: '0.3rem 0.65rem', 
                fontSize: '0.75rem', 
                borderColor: pressedKeyCodes.has('AudioVolumeMute') ? 'var(--color-emerald)' : undefined,
                color: pressedKeyCodes.has('AudioVolumeMute') ? 'var(--color-emerald)' : undefined
              }}
              onClick={() => handleKnobAction('mute')}
              title="Pressionar Knob (Mute)"
            >
              Mute
            </button>
            <button 
              className={`btn btn-secondary ${pressedKeyCodes.has('AudioVolumeUp') ? 'active' : ''}`}
              style={{ 
                padding: '0.3rem 0.65rem', 
                fontSize: '0.75rem',
                borderColor: pressedKeyCodes.has('AudioVolumeUp') ? 'var(--color-emerald)' : undefined,
                color: pressedKeyCodes.has('AudioVolumeUp') ? 'var(--color-emerald)' : undefined
              }}
              onClick={() => handleKnobAction('cw')}
              title="Girar horário (Volume +)"
            >
              <RotateCw size={12} /> Vol +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
