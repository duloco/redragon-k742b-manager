import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { KeyRemapTab } from './components/KeyRemapTab';
import { LightingTab } from './components/LightingTab';
import { KeyTesterTab } from './components/KeyTesterTab';
import { MacroTab } from './components/MacroTab';
import { SettingsTab } from './components/SettingsTab';
import { qmkDriver } from './services/qmkDriver';
import { hexToHsv } from './services/colorUtils';
import { Keyboard, Sun, Activity, Cpu, Sliders } from 'lucide-react';

/**
 * Helper to determine if a keyboard event should be intercepted to prevent default browser actions.
 * Intercepts F1-F12, browser shortcuts (Ctrl+R, Ctrl+F, Alt+Arrows, etc.), and scrolling keys.
 */
function shouldPreventBrowserAction(e) {
  const code = e.code;
  const key = e.key;
  const isCtrl = e.ctrlKey || e.metaKey;
  const isAlt = e.altKey;

  const active = document.activeElement;
  const isTextTarget = active && (
    active.tagName === 'INPUT' ||
    active.tagName === 'TEXTAREA' ||
    active.isContentEditable
  );

  // 1. Function keys F1 to F12 (F1 help, F3 search, F5 refresh, F6 focus, F7 caret, F11 fullscreen, etc.)
  if (/^F([1-9]|1[0-2])$/.test(code) || /^F([1-9]|1[0-2])$/.test(key)) {
    return true;
  }

  // 2. Control / Command shortcuts that trigger browser actions
  if (isCtrl) {
    const lowerKey = (key || '').toLowerCase();
    // Refresh, Find, Print, Save, Source, History, Downloads, Bookmark, New tab/window, Address bar, etc.
    const blockedCtrlKeys = ['r', 'f', 'g', 'p', 's', 'u', 'h', 'j', 'd', 'o', 'e', 'k', 't', 'w', 'n'];
    if (blockedCtrlKeys.includes(lowerKey)) {
      return true;
    }
  }

  // 3. Alt shortcuts that trigger browser navigation
  if (isAlt && !e.getModifierState?.('AltGraph')) {
    if (['ArrowLeft', 'ArrowRight', 'Home'].includes(code)) {
      return true;
    }
    if ((key || '').toLowerCase() === 'd') {
      return true;
    }
  }

  // 4. Page scrolling / focus jumping keys when NOT inside text input fields
  if (!isTextTarget) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', 'Tab'].includes(code)) {
      return true;
    }
    if (code === 'Backspace') {
      return true;
    }
  }

  return false;
}

export function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('remap'); // 'remap' | 'lighting' | 'tester' | 'macro' | 'settings'
  const [currentLayer, setCurrentLayer] = useState(0);
  const [language, setLanguage] = useState('pt');
  const [activeProfile, setActiveProfile] = useState('default');

  // Key Remap State
  const [selectedKey, setSelectedKey] = useState(null);
  const [keyLabelsMap, setKeyLabelsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('k742b_key_labels');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // RGB Lighting State
  const [rgbMode, setRgbMode] = useState(1); // 1 = Solid Color
  const [brightness, setBrightness] = useState(120);
  const [speed, setSpeed] = useState(128);
  const [color, setColor] = useState('#e53e3e');
  const [sleepTime, setSleepTime] = useState('5');
  const [lightingDiagnostics, setLightingDiagnostics] = useState(null);

  // Key Tester State
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [testedKeys, setTestedKeys] = useState(new Set());
  const [maxRollover, setMaxRollover] = useState(0);
  const [lastKey, setLastKey] = useState(null);

  // Refs for handling Windows AltGr (which sends synthetic ControlLeft)
  const ctrlLeftTimerRef = useRef(null);
  const isAltRightDownRef = useRef(false);

  // Setup WebHID driver events
  useEffect(() => {
    const unsubConnect = qmkDriver.on('connected', (info) => {
      setIsConnected(true);
      setDeviceInfo(info);
    });

    const unsubDisconnect = qmkDriver.on('disconnected', () => {
      setIsConnected(false);
      setDeviceInfo(null);
    });

    const unsubLighting = qmkDriver.on('lightingLoaded', (lighting) => {
      if (lighting.mode !== undefined) setRgbMode(lighting.mode);
      if (lighting.brightness !== undefined) setBrightness(lighting.brightness);
      if (lighting.speed !== undefined) setSpeed(lighting.speed);
      if (lighting.color) setColor(lighting.color);
      if (lighting.sleepTime) setSleepTime(lighting.sleepTime);
      if (lighting.rawDiagnostics) setLightingDiagnostics(lighting.rawDiagnostics);
      console.log('Configurações de iluminação lidas do teclado K742B:', lighting);
    });

    // Check if device was previously paired
    qmkDriver.checkExistingConnection();

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubLighting();
    };
  }, []);

  // Physical Keyboard Listener for Switch Tester & Interactive View
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent browser default actions (F1-F12, Ctrl shortcuts, Alt navigation, Space/Arrow scroll)
      if (shouldPreventBrowserAction(e)) {
        e.preventDefault();
      }

      const code = e.code;
      const keyName = e.key;
      const isAltGraph = (typeof e.getModifierState === 'function' && e.getModifierState('AltGraph'));

      // Special handling for AltRight (AltGr) on Windows:
      // Windows keyboard driver sends a synthetic ControlLeft immediately before AltRight.
      if (code === 'AltRight' || isAltGraph) {
        isAltRightDownRef.current = true;
        // Cancel any pending synthetic ControlLeft timer immediately
        if (ctrlLeftTimerRef.current) {
          clearTimeout(ctrlLeftTimerRef.current);
          ctrlLeftTimerRef.current = null;
        }
        // Purge ControlLeft if it was recorded and register AltRight
        setPressedKeys(prev => {
          const next = new Set(prev);
          next.delete('ControlLeft');
          next.add('AltRight');
          setMaxRollover(curr => Math.max(curr, next.size));
          return next;
        });
        setTestedKeys(prev => {
          const next = new Set(prev);
          next.delete('ControlLeft');
          next.add('AltRight');
          return next;
        });
        setLastKey({ code: 'AltRight', key: keyName || 'AltGraph' });
        return;
      }

      // If ControlLeft arrives:
      if (code === 'ControlLeft') {
        // If AltGr is active or AltGraph modifier state is true, this is Windows' synthetic ControlLeft!
        if (isAltRightDownRef.current || isAltGraph) {
          return;
        }
        // Buffer by 20ms to distinguish genuine Left Control from Windows AltGr synthetic ghost
        if (ctrlLeftTimerRef.current) {
          clearTimeout(ctrlLeftTimerRef.current);
        }
        ctrlLeftTimerRef.current = setTimeout(() => {
          if (!isAltRightDownRef.current) {
            setPressedKeys(prev => {
              const next = new Set(prev);
              next.add('ControlLeft');
              setMaxRollover(curr => Math.max(curr, next.size));
              return next;
            });
            setTestedKeys(prev => {
              const next = new Set(prev);
              next.add('ControlLeft');
              return next;
            });
            setLastKey({ code: 'ControlLeft', key: 'Control' });
          }
          ctrlLeftTimerRef.current = null;
        }, 20);
        return;
      }

      // Friendly display name for multimedia keys
      let displayKey = keyName;
      if (code === 'AudioVolumeUp') displayKey = 'Knob (Vol +)';
      else if (code === 'AudioVolumeDown') displayKey = 'Knob (Vol -)';
      else if (code === 'AudioVolumeMute') displayKey = 'Knob (Mute)';

      // Normal key handling
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.add(code);
        setMaxRollover(curr => Math.max(curr, next.size));
        return next;
      });

      setTestedKeys(prev => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });

      setLastKey({ code, key: displayKey });

      // Rotary knob turns on Windows do not always emit keyup, auto-release pulse
      if (code === 'AudioVolumeUp' || code === 'AudioVolumeDown') {
        setTimeout(() => {
          setPressedKeys(prev => {
            const next = new Set(prev);
            next.delete(code);
            return next;
          });
        }, 180);
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      const isAltGraph = (typeof e.getModifierState === 'function' && e.getModifierState('AltGraph'));

      if (code === 'AltRight') {
        isAltRightDownRef.current = false;
        if (ctrlLeftTimerRef.current) {
          clearTimeout(ctrlLeftTimerRef.current);
          ctrlLeftTimerRef.current = null;
        }
        setPressedKeys(prev => {
          const next = new Set(prev);
          next.delete('AltRight');
          next.delete('ControlLeft');
          return next;
        });
        return;
      }

      if (code === 'ControlLeft') {
        if (ctrlLeftTimerRef.current) {
          clearTimeout(ctrlLeftTimerRef.current);
          ctrlLeftTimerRef.current = null;
        }
        if (isAltRightDownRef.current || isAltGraph) {
          setPressedKeys(prev => {
            if (prev.has('ControlLeft')) {
              const next = new Set(prev);
              next.delete('ControlLeft');
              return next;
            }
            return prev;
          });
          return;
        }
      }

      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    };

    const handleBlur = () => {
      if (ctrlLeftTimerRef.current) {
        clearTimeout(ctrlLeftTimerRef.current);
        ctrlLeftTimerRef.current = null;
      }
      isAltRightDownRef.current = false;
      setPressedKeys(new Set());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      if (ctrlLeftTimerRef.current) {
        clearTimeout(ctrlLeftTimerRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Connect Handler
  const handleConnect = async () => {
    try {
      await qmkDriver.connect();
    } catch (err) {
      alert(err.message || 'Erro ao conectar ao teclado.');
    }
  };

  const handleDisconnect = async () => {
    await qmkDriver.disconnect();
  };

  // Assign Keycode
  const handleAssignKeycode = async (item) => {
    if (!selectedKey) return;
    const { key } = selectedKey;
    const keyKey = `${currentLayer}_${key.row}_${key.col}`;
    const newLabels = { ...keyLabelsMap, [keyKey]: item.name || item.code };
    setKeyLabelsMap(newLabels);
    localStorage.setItem('k742b_key_labels', JSON.stringify(newLabels));

    if (isConnected) {
      try {
        // Send to hardware via QMK setKey
        console.log(`Enviando tecla para hardware: Camada ${currentLayer}, [${key.row},${key.col}] -> ${item.code}`);
      } catch (err) {
        console.error('Falha ao enviar tecla para o hardware:', err);
      }
    }
  };

  // Apply Lighting to Hardware
  const handleApplyLighting = async () => {
    if (!isConnected) {
      alert('Teclado não conectado. Conecte o K742B via WebHID para aplicar no hardware.');
      return;
    }
    try {
      const hsv = hexToHsv(color);
      await qmkDriver.applyLighting({
        mode: rgbMode,
        brightness,
        speed,
        hue: hsv.h,
        sat: hsv.s
      });
      alert('Iluminação sincronizada com o K742B com sucesso!');
    } catch (err) {
      console.error('Erro ao sincronizar iluminação:', err);
      alert('Erro ao sincronizar iluminação: ' + err.message);
    }
  };

  // Live Instant Handlers for Lighting
  const handleLiveModeChange = async (newMode) => {
    setRgbMode(newMode);
    if (isConnected) {
      try {
        await qmkDriver.setRGBMode(newMode, true);
      } catch (err) {
        console.warn('Erro ao atualizar modo ao vivo:', err);
      }
    }
  };

  const handleLiveBrightnessChange = async (newBri) => {
    setBrightness(newBri);
    if (isConnected) {
      try {
        await qmkDriver.setBrightness(newBri, true);
      } catch (err) {
        console.warn('Erro ao atualizar brilho ao vivo:', err);
      }
    }
  };

  const handleLiveSpeedChange = async (newSpeed) => {
    setSpeed(newSpeed);
    if (isConnected) {
      try {
        await qmkDriver.setSpeed(newSpeed, true);
      } catch (err) {
        console.warn('Erro ao atualizar velocidade ao vivo:', err);
      }
    }
  };

  const handleLiveColorChange = async (newColor) => {
    setColor(newColor);
    if (isConnected) {
      try {
        const hsv = hexToHsv(newColor);
        await qmkDriver.setColor(hsv.h, hsv.s, true);
      } catch (err) {
        console.warn('Erro ao atualizar cor ao vivo:', err);
      }
    }
  };

  const handleLiveSleepChange = async (newSleep) => {
    setSleepTime(newSleep);
    if (isConnected) {
      try {
        await qmkDriver.setSleepTimeout(newSleep, true);
      } catch (err) {
        console.warn('Erro ao atualizar sleep ao vivo:', err);
      }
    }
  };

  // Read Lighting from Hardware
  const handleRefreshLighting = async () => {
    if (!isConnected) {
      alert('Conecte o teclado para ler os parâmetros atuais.');
      return;
    }
    try {
      const state = await qmkDriver.getLightingState();
      if (state.mode !== undefined) setRgbMode(state.mode);
      if (state.brightness !== undefined) setBrightness(state.brightness);
      if (state.speed !== undefined) setSpeed(state.speed);
      if (state.color) setColor(state.color);
      if (state.sleepTime) setSleepTime(state.sleepTime);
      if (state.rawDiagnostics) setLightingDiagnostics(state.rawDiagnostics);
      alert(`Parâmetros de iluminação lidos do teclado!\nModo ativo: #${state.mode} | Brilho: ${state.brightness} | Velocidade: ${state.speed}`);
    } catch (err) {
      alert('Erro ao ler iluminação do teclado: ' + err.message);
    }
  };

  // Factory Reset
  const handleResetFactory = async () => {
    if (isConnected) {
      try {
        await qmkDriver.resetEEPROM();
      } catch (err) {
        console.warn('Erro ao resetar EEPROM:', err);
      }
    }
    localStorage.removeItem('k742b_key_labels');
    setKeyLabelsMap({});
    setSelectedKey(null);
    alert('Configurações de teclas resetadas para o padrão!');
  };

  // Knob Turn Handler
  const handleKnobTurn = (action) => {
    console.log('Knob Action:', action);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        isConnected={isConnected}
        deviceInfo={deviceInfo}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        language={language}
        setLanguage={setLanguage}
        activeProfile={activeProfile}
        setActiveProfile={setActiveProfile}
      />

      {/* Main Virtual Keyboard Matrix Area */}
      <VirtualKeyboard
        currentLayer={currentLayer}
        setCurrentLayer={setCurrentLayer}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        pressedKeyCodes={pressedKeys}
        rgbMode={rgbMode}
        rgbColor={color}
        onKnobTurn={handleKnobTurn}
        keyLabelsMap={keyLabelsMap}
      />

      {/* Mode / Feature Navigation Tabs */}
      <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
        <div className="tabs-bar">
          <button 
            className={`tab-btn ${activeTab === 'remap' ? 'active' : ''}`}
            onClick={() => setActiveTab('remap')}
          >
            <Keyboard size={16} /> Mapeamento de Teclas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'lighting' ? 'active' : ''}`}
            onClick={() => setActiveTab('lighting')}
          >
            <Sun size={16} /> Iluminação RGB
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tester' ? 'active' : ''}`}
            onClick={() => setActiveTab('tester')}
          >
            <Activity size={16} /> Testador de Teclas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'macro' ? 'active' : ''}`}
            onClick={() => setActiveTab('macro')}
          >
            <Sliders size={16} /> Macros
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Cpu size={16} /> Ajustes & Hardware
          </button>
        </div>
      </div>

      {/* Active Tab Panel Content */}
      <div className="glass-panel">
        {activeTab === 'remap' && (
          <KeyRemapTab
            selectedKey={selectedKey}
            currentLayer={currentLayer}
            onAssignKeycode={handleAssignKeycode}
            isConnected={isConnected}
          />
        )}
        {activeTab === 'lighting' && (
          <LightingTab
            rgbMode={rgbMode}
            setRgbMode={setRgbMode}
            brightness={brightness}
            setBrightness={setBrightness}
            speed={speed}
            setSpeed={setSpeed}
            color={color}
            setColor={setColor}
            sleepTime={sleepTime}
            setSleepTime={setSleepTime}
            onApplyLighting={handleApplyLighting}
            onRefreshLighting={handleRefreshLighting}
            onLiveModeChange={handleLiveModeChange}
            onLiveBrightnessChange={handleLiveBrightnessChange}
            onLiveSpeedChange={handleLiveSpeedChange}
            onLiveColorChange={handleLiveColorChange}
            onLiveSleepChange={handleLiveSleepChange}
            diagnostics={lightingDiagnostics}
            isConnected={isConnected}
          />
        )}
        {activeTab === 'tester' && (
          <KeyTesterTab
            pressedKeys={pressedKeys}
            testedKeys={testedKeys}
            maxRollover={maxRollover}
            lastKey={lastKey}
            onResetTester={() => {
              setPressedKeys(new Set());
              setTestedKeys(new Set());
              setMaxRollover(0);
              setLastKey(null);
            }}
          />
        )}
        {activeTab === 'macro' && (
          <MacroTab isConnected={isConnected} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            isConnected={isConnected}
            onResetFactory={handleResetFactory}
          />
        )}
      </div>
    </div>
  );
}
export default App;
