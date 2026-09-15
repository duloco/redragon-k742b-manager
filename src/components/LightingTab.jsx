import React, { useState } from 'react';
import { K742B_CONFIG } from '../services/k742bLayout';
import { Sun, Zap, Moon, Sparkles, Palette, RefreshCw, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

const PRESET_COLORS = [
  '#e53e3e', // Redragon Red
  '#00e5ff', // Cyan
  '#a855f7', // Purple
  '#22c55e', // Emerald
  '#eab308', // Yellow
  '#f97316', // Orange
  '#ec4899', // Pink
  '#ffffff', // White
];

export function LightingTab({ 
  rgbMode, 
  setRgbMode, 
  brightness, 
  setBrightness, 
  speed, 
  setSpeed, 
  color, 
  setColor,
  sleepTime,
  setSleepTime,
  onApplyLighting,
  onRefreshLighting,
  onLiveModeChange,
  onLiveBrightnessChange,
  onLiveSpeedChange,
  onLiveColorChange,
  onLiveSleepChange,
  diagnostics,
  isConnected
}) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const effects = K742B_CONFIG.lighting?.underglowEffects || [];

  return (
    <div className="tab-content-area">
      <div className="rgb-controls-grid">
        {/* Left Column: Mode & Colors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="slider-group">
            <label className="slider-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="var(--color-brand)" /> EFEITO DE ILUMINAÇÃO RGB (45 MODOS)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>Modo #{rgbMode}</span>
            </label>
            <select
              value={rgbMode}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRgbMode(val);
                onLiveModeChange?.(val);
              }}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1rem', width: '100%', textAlign: 'left', fontSize: '0.9rem' }}
            >
              {effects.map(([name, id]) => (
                <option key={id} value={id}>
                  {id.toString().padStart(2, '0')} - {name}
                </option>
              ))}
            </select>
          </div>

          {/* Color Picker & Presets */}
          <div className="slider-group">
            <label className="slider-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Palette size={16} color="var(--color-cyan)" /> COR PRINCIPAL
              </span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{color.toUpperCase()}</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                onBlur={(e) => onLiveColorChange?.(e.target.value)}
                style={{
                  width: '42px',
                  height: '42px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      transform: color === c ? 'scale(1.15)' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                    onClick={() => {
                      setColor(c);
                      onLiveColorChange?.(c);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sleep Time Selector */}
          <div className="slider-group">
            <label className="slider-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Moon size={16} color="var(--color-amber)" /> TEMPO DE SUSPENSÃO (SLEEP)
              </span>
            </label>
            <select
              value={sleepTime}
              onChange={(e) => {
                const val = e.target.value;
                setSleepTime(val);
                onLiveSleepChange?.(val);
              }}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1rem', width: '100%', textAlign: 'left', fontSize: '0.9rem' }}
            >
              <option value="1">1 minuto</option>
              <option value="3">3 minutos</option>
              <option value="5">5 minutos (Padrão)</option>
              <option value="10">10 minutos</option>
              <option value="20">20 minutos</option>
              <option value="30">30 minutos</option>
              <option value="0">Não suspender (Sempre ligado)</option>
            </select>
          </div>
        </div>

        {/* Right Column: Sliders & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Brightness Slider */}
          <div className="slider-group">
            <div className="slider-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sun size={16} color="var(--color-amber)" /> BRILHO DO LED
              </span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round((brightness / 180) * 100)}% ({brightness})</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="10"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              onPointerUp={(e) => onLiveBrightnessChange?.(Number(e.target.value))}
              onKeyUp={(e) => onLiveBrightnessChange?.(Number(e.target.value))}
            />
          </div>

          {/* Speed Slider */}
          <div className="slider-group">
            <div className="slider-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={16} color="var(--color-cyan)" /> VELOCIDADE DO EFEITO
              </span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{speed}</span>
            </div>
            <input
              type="range"
              min="51"
              max="255"
              step="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              onPointerUp={(e) => onLiveSpeedChange?.(Number(e.target.value))}
              onKeyUp={(e) => onLiveSpeedChange?.(Number(e.target.value))}
            />
          </div>

          {/* Save / Apply Button */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.8rem' }}
                onClick={onRefreshLighting}
                title="Ler modo de iluminação, brilho e velocidade atualmente ativos no hardware"
              >
                <RefreshCw size={15} /> Ler do Teclado
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2, padding: '0.75rem' }}
                onClick={onApplyLighting}
              >
                <Sparkles size={16} /> Salvar no Teclado
              </button>
            </div>
            
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-dim)',
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <Terminal size={12} /> Diagnóstico de Pacotes HID {showDiagnostics ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              {isConnected 
                ? 'Atualizações instantâneas ativas: alterações nos efeitos e cores são refletidas na hora!' 
                : 'Conecte o teclado para controle instantâneo via WebHID.'}
            </span>
          </div>
        </div>
      </div>

      {/* Hardware Diagnostic Drawer */}
      {showDiagnostics && (
        <div style={{
          marginTop: '1.25rem',
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.45)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--color-cyan)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>RESPOSTAS BRUTAS DO MICROCONTROLADOR K742B</span>
            <span style={{ color: 'var(--text-dim)' }}>QMK RAW HID (UsagePage 0xFF60, Usage 0x61)</span>
          </div>
          {diagnostics ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px' }}>
                <div style={{ color: 'var(--color-brand)', fontWeight: 600 }}>Modo RGB [8, 3, 2]:</div>
                <div>{diagnostics['8_3_2'] ? `[${diagnostics['8_3_2'].join(', ')}] -> Byte 3: #${diagnostics['8_3_2'][3]}` : (diagnostics['8_3_2_err'] || 'Não respondido')}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px' }}>
                <div style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Brilho [8, 3, 1]:</div>
                <div>{diagnostics['8_3_1'] ? `[${diagnostics['8_3_1'].join(', ')}] -> Byte 3: ${diagnostics['8_3_1'][3]}` : (diagnostics['8_3_1_err'] || 'Não respondido')}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px' }}>
                <div style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>Velocidade [8, 3, 3]:</div>
                <div>{diagnostics['8_3_3'] ? `[${diagnostics['8_3_3'].join(', ')}] -> Byte 3: ${diagnostics['8_3_3'][3]}` : (diagnostics['8_3_3_err'] || 'Não respondido')}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px' }}>
                <div style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>Cor RGB [8, 3, 4]:</div>
                <div>{diagnostics['8_3_4'] ? `[${diagnostics['8_3_4'].join(', ')}] -> Hue: ${diagnostics['8_3_4'][3]}, Sat: ${diagnostics['8_3_4'][4]}` : (diagnostics['8_3_4_err'] || 'Não respondido')}</div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-dim)' }}>
              Nenhum dado capturado ainda. Clique em "Ler do Teclado" com o teclado conectado para inspecionar os pacotes.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
