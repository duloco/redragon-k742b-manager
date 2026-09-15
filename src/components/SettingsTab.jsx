import React, { useState } from 'react';
import { Settings, Cpu, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export function SettingsTab({ isConnected, onResetFactory }) {
  const [debounce, setDebounce] = useState('2');
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="tab-content-area">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Hardware & System Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} color="var(--color-cyan)" /> Especificações do Hardware
          </h3>

          <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Dispositivo</span>
              <span style={{ fontWeight: 600 }}>Redragon K742B (Arlokks)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Placa Base Interna</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>fengrun 7194-742B 3M</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>USB Vendor ID (VID)</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>0x342D (13357)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>USB Product ID (PID)</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>0xE4BC (58556)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Matriz de Teclas</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>6 Linhas × 18 Colunas (94 Teclas + Knob)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Protocolo VIA / QMK</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-emerald)' }}>Raw HID v9 (0xFF60 / 0x61)</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={20} color="var(--color-emerald)" />
            <div style={{ fontSize: '0.8rem' }}>
              <div>Desenvolvido por <strong>Scartzeut Inc.</strong></div>
              <div style={{ color: 'var(--text-dim)' }}>WebHID Engine &bull; Versão 2.0 Moderna</div>
            </div>
          </div>
        </div>

        {/* Configurations & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={18} color="var(--color-brand)" /> Parâmetros de Desempenho
          </h3>

          <div className="slider-group">
            <label className="slider-header">
              <span>TEMPO DE DEBOUNCE (ANTI-CHATTERING)</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{debounce} ms</span>
            </label>
            <select
              value={debounce}
              onChange={(e) => setDebounce(e.target.value)}
              className="btn btn-secondary"
              style={{ width: '100%', textAlign: 'left' }}
            >
              <option value="1">1 ms (Latência ultrabaixa para Esports)</option>
              <option value="2">2 ms (Recomendado - Equilíbrio Ideal)</option>
              <option value="5">5 ms (Padrão de Fábrica)</option>
              <option value="10">10 ms (Máxima filtragem de ruído mecânico)</option>
            </select>
          </div>

          {/* Factory Reset */}
          <div style={{ marginTop: 'auto', background: 'rgba(239, 68, 68, 0.05)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>
              <AlertTriangle size={18} /> Restaurar Padrões de Fábrica
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Isso apagará todas as macros, camadas customizadas e iluminação armazenadas na EEPROM do teclado.
            </p>

            {showConfirm ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-outline-danger"
                  style={{ background: '#ef4444', color: 'white', flex: 1 }}
                  onClick={() => {
                    onResetFactory();
                    setShowConfirm(false);
                  }}
                >
                  Confirmar Reset
                </button>
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-outline-danger" 
                style={{ width: '100%' }}
                onClick={() => setShowConfirm(true)}
              >
                <RefreshCw size={14} /> Resetar EEPROM do Teclado
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
