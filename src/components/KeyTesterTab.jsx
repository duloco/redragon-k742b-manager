import React from 'react';
import { RotateCcw, CheckCircle, ShieldCheck, Activity, Volume2 } from 'lucide-react';

export function KeyTesterTab({ 
  pressedKeys = new Set(), 
  testedKeys = new Set(), 
  maxRollover = 0, 
  lastKey = null, 
  onResetTester 
}) {
  return (
    <div className="tab-content-area">
      {/* Stats Banner */}
      <div className="tester-stats-banner">
        <div className="stat-item">
          <span className="stat-label">Teclas Atualmente Pressionadas</span>
          <span className="stat-value" style={{ color: pressedKeys.size > 0 ? 'var(--color-emerald)' : 'var(--text-dim)' }}>
            {pressedKeys.size}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Rollover Máximo Registrado (NKRO)</span>
          <span className="stat-value" style={{ color: 'var(--color-cyan)' }}>
            {maxRollover}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Total de Teclas Testadas</span>
          <span className="stat-value">
            {testedKeys.size} / 94
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Última Tecla Pressionada</span>
          <span className="stat-value" style={{ color: 'var(--color-brand-hover)', fontSize: '1.25rem' }}>
            {lastKey ? `${lastKey.key} (${lastKey.code})` : 'Nenhuma'}
          </span>
        </div>

        <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          <button className="btn btn-secondary" onClick={onResetTester}>
            <RotateCcw size={16} /> Limpar Teste
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--color-emerald)" /> Instruções de Teste de Switch & Latência
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
          Pressione qualquer tecla física do seu <strong>Redragon K742B</strong>. O teclado virtual acima acenderá em tempo real para confirmar que o switch e o circuito de matrix estão operando perfeitamente. Teste combinações de teclas simultâneas para verificar o <strong>Anti-Ghosting / N-Key Rollover (NKRO)</strong>.
        </p>

        {/* Rotary Knob Status Card */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-surface-elevated)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          <Volume2 size={20} color="var(--color-brand)" />
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
              Rotary Knob (Volume & Mute)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Gire o knob físico no sentido horário (Vol +), anti-horário (Vol -) ou pressione para baixo (Mute).
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.2rem 0.6rem', 
              borderRadius: 'var(--radius-full)', 
              background: testedKeys.has('AudioVolumeUp') ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-dark)',
              color: testedKeys.has('AudioVolumeUp') ? 'var(--color-emerald)' : 'var(--text-dim)',
              border: '1px solid',
              borderColor: testedKeys.has('AudioVolumeUp') ? 'var(--color-emerald)' : 'var(--border-subtle)',
              fontFamily: 'var(--font-mono)'
            }}>
              {testedKeys.has('AudioVolumeUp') ? '✓ Vol +' : 'Vol +'}
            </span>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.2rem 0.6rem', 
              borderRadius: 'var(--radius-full)', 
              background: testedKeys.has('AudioVolumeDown') ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-dark)',
              color: testedKeys.has('AudioVolumeDown') ? 'var(--color-emerald)' : 'var(--text-dim)',
              border: '1px solid',
              borderColor: testedKeys.has('AudioVolumeDown') ? 'var(--color-emerald)' : 'var(--border-subtle)',
              fontFamily: 'var(--font-mono)'
            }}>
              {testedKeys.has('AudioVolumeDown') ? '✓ Vol -' : 'Vol -'}
            </span>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.2rem 0.6rem', 
              borderRadius: 'var(--radius-full)', 
              background: testedKeys.has('AudioVolumeMute') ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-dark)',
              color: testedKeys.has('AudioVolumeMute') ? 'var(--color-emerald)' : 'var(--text-dim)',
              border: '1px solid',
              borderColor: testedKeys.has('AudioVolumeMute') ? 'var(--color-emerald)' : 'var(--border-subtle)',
              fontFamily: 'var(--font-mono)'
            }}>
              {testedKeys.has('AudioVolumeMute') ? '✓ Mute' : 'Mute'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
