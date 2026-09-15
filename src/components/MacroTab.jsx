import React, { useState } from 'react';
import { Play, Square, Plus, Trash2, Download, Upload, Clock } from 'lucide-react';

export function MacroTab({ isConnected }) {
  const [macros, setMacros] = useState([
    { id: 0, name: 'Macro 1 - Combo FPS', actions: [{ type: 'down', key: 'Shift' }, { type: 'delay', ms: 50 }, { type: 'down', key: 'W' }, { type: 'delay', ms: 200 }, { type: 'up', key: 'W' }, { type: 'up', key: 'Shift' }] },
    { id: 1, name: 'Macro 2 - Copiar & Colar', actions: [{ type: 'down', key: 'Ctrl' }, { type: 'down', key: 'C' }, { type: 'up', key: 'C' }, { type: 'up', key: 'Ctrl' }] }
  ]);
  const [selectedMacroId, setSelectedMacroId] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const activeMacro = macros.find(m => m.id === selectedMacroId) || macros[0];

  const handleToggleRecord = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="tab-content-area">
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
        {/* Left: Macro List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>LISTA DE MACROS</span>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              onClick={() => {
                const newId = macros.length;
                setMacros([...macros, { id: newId, name: `Macro ${newId + 1}`, actions: [] }]);
                setSelectedMacroId(newId);
              }}
            >
              <Plus size={14} /> Nova
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {macros.map(m => (
              <div
                key={m.id}
                onClick={() => setSelectedMacroId(m.id)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedMacroId === m.id ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: `1px solid ${selectedMacroId === m.id ? 'var(--color-brand)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: selectedMacroId === m.id ? 600 : 400,
                  color: selectedMacroId === m.id ? 'white' : 'var(--text-muted)'
                }}
              >
                {m.name}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Macro Editor / Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{activeMacro?.name}</h3>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn ${isRecording ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleToggleRecord}
                style={{ background: isRecording ? '#ef4444' : undefined }}
              >
                {isRecording ? <Square size={16} /> : <Play size={16} />}
                {isRecording ? 'Finalizar Gravação' : 'Iniciar Gravação'}
              </button>
            </div>
          </div>

          {/* Actions Timeline */}
          <div 
            className="glass-panel" 
            style={{ 
              minHeight: '220px', 
              maxHeight: '300px', 
              overflowY: 'auto', 
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            {activeMacro?.actions?.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', margin: 'auto', fontSize: '0.85rem' }}>
                Nenhuma ação gravada ainda. Clique em "Iniciar Gravação" para registrar combinações de teclas.
              </div>
            ) : (
              activeMacro?.actions?.map((act, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.85rem',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>#{idx + 1}</span>
                    {act.type === 'delay' ? (
                      <span style={{ color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} /> Delay {act.ms}ms
                      </span>
                    ) : (
                      <span style={{ color: act.type === 'down' ? 'var(--color-emerald)' : 'var(--text-dim)' }}>
                        {act.type === 'down' ? 'Pressionar' : 'Soltar'}: <strong>{act.key}</strong>
                      </span>
                    )}
                  </div>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                    onClick={() => {
                      const updatedActions = activeMacro.actions.filter((_, i) => i !== idx);
                      setMacros(macros.map(m => m.id === selectedMacroId ? { ...m, actions: updatedActions } : m));
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
