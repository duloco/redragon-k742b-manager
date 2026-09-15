import React, { useState, useEffect, useRef } from 'react';
import { KEYCODE_CATEGORIES, QMK_KEYCODES } from '../services/keycodes';
import { Layers, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

// Pre-indexed list of all keycodes for rapid lookup
const ALL_KEYCODES = [];
KEYCODE_CATEGORIES.forEach(cat => {
  (cat.keycodes || []).forEach(kc => {
    ALL_KEYCODES.push({ ...kc, categoryId: cat.id });
  });
});

const NORM_TABLE = {
  'esc': 'kc_esc', 'enter': 'kc_ent', 'bksp': 'kc_bspc', 'backspace': 'kc_bspc',
  'tab': 'kc_tab', 'caps': 'kc_caps', 'capslk': 'kc_caps', 'capslock': 'kc_caps',
  'lshft': 'kc_lsft', 'rshft': 'kc_rsft', 'shift': 'kc_lsft', '↑ shift': 'kc_lsft',
  'lctl': 'kc_lctl', 'rctl': 'kc_rctl', 'ctrl': 'kc_lctl',
  'lalt': 'kc_lalt', 'ralt': 'kc_ralt', 'alt': 'kc_lalt', 'altgr': 'kc_ralt',
  'lwin': 'kc_lgui', 'win': 'kc_lgui', 'space': 'kc_spc', ' ': 'kc_spc',
  'del': 'kc_del', 'ins': 'kc_ins', 'pgup': 'kc_pgup', 'pgdn': 'kc_pgdn',
  'mute': 'kc_mute', 'audio_mute': 'kc_mute',
  '↑': 'kc_up', '↓': 'kc_down', '←': 'kc_left', '→': 'kc_right',
  '!1': 'kc_1', '1!': 'kc_1', '@2': 'kc_2', '2@': 'kc_2', '#3': 'kc_3', '3#': 'kc_3',
  '$4': 'kc_4', '4$': 'kc_4', '%5': 'kc_5', '5%': 'kc_5', '^6': 'kc_6', '6^': 'kc_6',
  '&7': 'kc_7', '7&': 'kc_7', '*8': 'kc_8', '8*': 'kc_8', '(9': 'kc_9', '9(': 'kc_9',
  ')0': 'kc_0', '0)': 'kc_0',
  '_-': 'kc_minus', '-_': 'kc_minus', '+=': 'kc_eql', '=+': 'kc_eql',
  'n.lck': 'kc_num', 'num': 'kc_num',
  '÷': 'kc_psls', '/': 'kc_psls',
  '*': 'kc_past',
  '-': 'kc_pmns', '+': 'kc_ppls', 'n.ent': 'kc_pent',
  '.': 'kc_pdot', ',': 'kc_comm',
  'ç': 'kc_scln', ';': 'kc_scln', ':;': 'kc_scln',
  '~ ^': 'kc_quot', '´ `': 'kc_lbrc', '[ {': 'kc_rbrc',
  '/ ?': 'kc_ro', 'ro': 'kc_ro'
};

export function findMatchingKeycode(label, rawKey) {
  if (!label && !rawKey) return null;
  const candidates = [label, rawKey?.value].filter(Boolean);

  for (const c of candidates) {
    const v = String(c).trim().toLowerCase();
    // 1. Direct code match (e.g. "KC_A", "KC_ESC")
    let found = ALL_KEYCODES.find(k => k.code?.toLowerCase() === v);
    if (found) return found;

    // 2. Direct name match (e.g. "A", "Esc", "F1", "F12")
    found = ALL_KEYCODES.find(k => k.name?.toLowerCase() === v);
    if (found) return found;

    // 3. Direct keys match
    found = ALL_KEYCODES.find(k => k.keys?.toLowerCase() === v);
    if (found) return found;

    // 4. Normalized table match
    if (NORM_TABLE[v]) {
      found = ALL_KEYCODES.find(k => k.code?.toLowerCase() === NORM_TABLE[v]);
      if (found) return found;
    }
  }

  return null;
}

export function KeyRemapTab({ selectedKey, currentLayer, onAssignKeycode, isConnected }) {
  const [activeCategory, setActiveCategory] = useState('basic');
  const activeItemRef = useRef(null);

  const categories = KEYCODE_CATEGORIES || [];
  const currentCategoryData = categories.find(c => c.id === activeCategory);

  // Identify currently mapped keycode for the selected keyboard key
  const mappedKeycode = selectedKey ? findMatchingKeycode(selectedKey.label, selectedKey.key) : null;

  // Auto-switch to the category containing the mapped keycode when selection changes
  useEffect(() => {
    if (mappedKeycode?.categoryId) {
      setActiveCategory(mappedKeycode.categoryId);
    }
  }, [selectedKey]);

  // Auto-scroll the currently mapped key into view in the palette grid
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [selectedKey, activeCategory]);

  return (
    <div className="tab-content-area">
      {/* Selection Status Banner */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>TECLA SELECIONADA:</span>
          {selectedKey ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span 
                style={{ 
                  background: 'var(--bg-surface-elevated)', 
                  border: '1px solid var(--color-cyan)',
                  color: 'var(--color-cyan)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}
              >
                {selectedKey.label || selectedKey.key?.value}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                (Camada {currentLayer}, Linha {selectedKey.key?.row}, Coluna {selectedKey.key?.col})
              </span>

              {mappedKeycode && (
                <div 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    background: 'rgba(16, 185, 129, 0.12)', 
                    padding: '0.25rem 0.65rem', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    marginLeft: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', fontWeight: 700 }}>
                    MAPEAMENTO ATUAL:
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                    {mappedKeycode.code}
                  </span>
                  {mappedKeycode.name && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-emerald)' }}>
                      ({mappedKeycode.name})
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span style={{ color: 'var(--color-amber)', fontSize: '0.85rem' }}>
              Clique em qualquer tecla do teclado acima para remapear.
            </span>
          )}
        </div>

        {selectedKey && (
          <span style={{ fontSize: '0.8rem', color: 'var(--color-emerald)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={16} /> Pronta para atribuir
          </span>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {categories.map(cat => {
          const hasCurrentKey = mappedKeycode?.categoryId === cat.id;
          return (
            <button
              key={cat.id}
              className={`btn btn-secondary ${activeCategory === cat.id ? 'active' : ''}`}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                background: activeCategory === cat.id ? 'var(--color-brand)' : undefined,
                color: activeCategory === cat.id ? 'white' : undefined,
                borderColor: activeCategory === cat.id ? 'var(--color-brand)' : (hasCurrentKey ? 'var(--color-emerald)' : undefined),
                position: 'relative'
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
              {hasCurrentKey && (
                <span 
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--color-emerald)',
                    marginLeft: '0.35rem',
                    boxShadow: '0 0 6px var(--color-emerald)'
                  }} 
                  title="Contém a tecla atualmente mapeada"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Palette Grid */}
      <div className="palette-grid glass-panel">
        {currentCategoryData?.keycodes?.map((item, idx) => {
          const isCurrentlyMapped = mappedKeycode && (
            item.code === mappedKeycode.code || 
            (item.name && item.name === mappedKeycode.name)
          );

          return (
            <div
              key={idx}
              ref={isCurrentlyMapped ? activeItemRef : null}
              className={`palette-item ${isCurrentlyMapped ? 'currently-mapped' : ''}`}
              title={item.title || item.name}
              onClick={() => {
                if (selectedKey) {
                  onAssignKeycode(item);
                }
              }}
            >
              {isCurrentlyMapped && (
                <span className="mapped-badge">✓ Mapeada</span>
              )}
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.name || item.code}</span>
              <span style={{ fontSize: '0.65rem', color: isCurrentlyMapped ? 'var(--color-emerald)' : 'var(--text-dim)', marginTop: '2px' }}>
                {item.title?.slice(0, 14)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
