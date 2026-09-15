import React from 'react';
import { Usb, Globe, Shield, RefreshCw } from 'lucide-react';

export function Header({ 
  isConnected, 
  deviceInfo, 
  onConnect, 
  onDisconnect, 
  language, 
  setLanguage,
  activeProfile,
  setActiveProfile
}) {
  return (
    <header className="header-container glass-panel">
      <div className="brand-section">
        <div className="brand-logo-badge">REDRAGON</div>
        <div className="brand-title-group">
          <h1>
            K742B <span style={{ color: 'var(--color-brand)', fontSize: '0.9rem' }}>ARLOKKS</span>
          </h1>
          <span className="brand-dev-tag">Scartzeut Inc. &bull; QMK/VIA Engine</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Profile Selector */}
        <select 
          value={activeProfile} 
          onChange={(e) => setActiveProfile(e.target.value)}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          <option value="default">Perfil: Padrão</option>
          <option value="gaming">Perfil: Gaming FPS</option>
          <option value="work">Perfil: Produtividade</option>
        </select>

        {/* Language Switcher */}
        <button 
          className="btn btn-secondary"
          onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
          title="Alternar Idioma"
        >
          <Globe size={16} />
          <span>{language === 'pt' ? 'Português' : 'English'}</span>
        </button>

        {/* Connection Status Pill */}
        <div className="connection-pill">
          <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>{isConnected ? 'K742B Conectado' : 'Desconectado'}</span>
        </div>

        {/* Connect / Disconnect Action */}
        {isConnected ? (
          <button className="btn btn-outline-danger" onClick={onDisconnect}>
            Desconectar
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onConnect}>
            <Usb size={16} />
            Conectar Teclado
          </button>
        )}
      </div>
    </header>
  );
}
