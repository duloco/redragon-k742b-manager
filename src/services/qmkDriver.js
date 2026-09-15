/**
 * QMK / VIA WebHID Driver for Redragon K742B (Arlokks)
 * Developed by Scartzeut Inc.
 * 
 * Hardware IDs:
 * - Vendor ID: 0x342D (13357)
 * - Product ID: 0xE4BC (58556)
 * - Usage Page: 0xFF60 (65376)
 * - Usage: 0x61 (97)
 */

export const DEVICE_VID = 0x342D;
export const DEVICE_PID = 0xE4BC;
export const USAGE_PAGE = 0xFF60;
export const USAGE = 0x61;

// QMK / VIA RAW HID Commands
export const CMD = {
  GET_PROTOCOL_VERSION: 0x01,
  GET_KEYBOARD_VALUE: 0x02,
  SET_KEYBOARD_VALUE: 0x03,
  GET_SET_KEY: 0x04,
  RESET_EEPROM: 0x05,
  SAVE_EEPROM: 0x06,
  SET_LIGHTING: 0x07,
  GET_LIGHTING: 0x08,
  GET_MACRO_COUNT: 0x0C,
  GET_MACRO_BUFFER: 0x0D,
  GET_LAYER_COUNT: 0x11,
  GET_KEYMAP_BUFFER: 0x12,
};

import { hsvToHex } from './colorUtils';

class QMKDriver {
  constructor() {
    this.device = null;
    this.protocolVersion = 9;
    this.layerCount = 2;
    this.isConnected = false;
    this.listeners = new Map();
    this.commandQueue = [];
    this.isFlushingQueue = false;
    this.waitingResolvers = [];

    // Bind WebHID events
    if (typeof navigator !== 'undefined' && navigator.hid) {
      navigator.hid.addEventListener('disconnect', (e) => {
        if (this.device && e.device === this.device) {
          this.handleDisconnect();
        }
      });
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    this.listeners.set(event, this.listeners.get(event).filter(cb => cb !== callback));
  }

  emit(event, ...args) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(cb => {
      try { cb(...args); } catch (e) { console.error(`Error in event listener ${event}:`, e); }
    });
  }

  handleDisconnect() {
    this.device = null;
    this.isConnected = false;
    this.waitingResolvers.forEach(r => r.reject(new Error('Dispositivo desconectado.')));
    this.waitingResolvers = [];
    this.commandQueue = [];
    this.isFlushingQueue = false;
    this.emit('disconnected');
  }

  async checkExistingConnection() {
    if (!navigator.hid) return false;
    try {
      const devices = await navigator.hid.getDevices();
      // STRICT: Must match the Raw HID collection (0xFF60, 0x61).
      // Never connect to standard typing keyboard interface which blocks output reports.
      const match = devices.find(d => 
        d.collections?.some(c => c.usagePage === USAGE_PAGE && c.usage === USAGE)
      );
      if (match) {
        await this.initializeDevice(match);
        return true;
      }
    } catch (err) {
      console.warn('Could not auto-connect:', err);
    }
    return false;
  }

  async connect() {
    if (!navigator.hid) {
      throw new Error('Seu navegador não suporta WebHID. Utilize o Google Chrome, Edge ou Brave.');
    }

    // STRICT: Only request the Raw HID / VIA interface (usagePage 0xFF60, usage 0x61).
    // NEVER include bare vendorId/productId filter without usagePage, because that allows
    // selecting the standard typing keyboard interface where sendReport is blocked by the OS!
    const filters = [
      { usagePage: USAGE_PAGE, usage: USAGE }
    ];

    const devices = await navigator.hid.requestDevice({ filters });
    if (!devices || devices.length === 0) {
      throw new Error('Nenhum teclado selecionado.');
    }

    return await this.initializeDevice(devices[0]);
  }

  async initializeDevice(hidDevice) {
    if (!hidDevice.opened) {
      await hidDevice.open();
    }

    this.device = hidDevice;
    this.isConnected = true;

    this.device.addEventListener('inputreport', (event) => {
      const data = new Uint8Array(event.data.buffer, event.data.byteOffset, event.data.byteLength);

      if (this.waitingResolvers.length === 0) return;

      // In half-duplex USB Raw HID, host sends a request and device replies with one report.
      // Always resolve the oldest waiting command in FIFO order.
      const item = this.waitingResolvers.shift();
      item.resolve(data);
    });

    // Query keyboard metadata
    try {
      this.protocolVersion = await this.getProtocolVersion();
    } catch (e) {
      this.protocolVersion = 9;
    }

    try {
      this.layerCount = await this.getLayerCount();
    } catch (e) {
      this.layerCount = 2;
    }

    this.emit('connected', {
      productName: hidDevice.productName || 'Redragon K742B (Arlokks)',
      vendorId: hidDevice.vendorId,
      productId: hidDevice.productId,
      protocolVersion: this.protocolVersion,
      layerCount: this.layerCount
    });

    // Automatically read active lighting mode and settings from keyboard
    try {
      const lighting = await this.getLightingState();
      this.emit('lightingLoaded', lighting);
    } catch (err) {
      console.warn('Não foi possível carregar a iluminação inicial automaticamente:', err);
    }

    return true;
  }

  async disconnect() {
    if (this.device && this.device.opened) {
      await this.device.close();
    }
    this.handleDisconnect();
  }

  async sendCommand(commandId, payload = [], timeoutMs = 1500) {
    if (!this.device || !this.device.opened) {
      throw new Error('Teclado não conectado.');
    }

    return new Promise((resolve, reject) => {
      this.commandQueue.push({ commandId, payload, timeoutMs, resolve, reject });
      if (!this.isFlushingQueue) {
        this._flushQueue();
      }
    });
  }

  async _flushQueue() {
    if (this.isFlushingQueue) return;
    this.isFlushingQueue = true;

    while (this.commandQueue.length > 0) {
      const { commandId, payload, timeoutMs, resolve, reject } = this.commandQueue.shift();
      try {
        const result = await this._executeCommand(commandId, payload, timeoutMs);
        resolve(result);
      } catch (err) {
        reject(err);
      }
      // Safety delay between consecutive raw HID reports so the microcontroller USB endpoint does not stall
      await new Promise(r => setTimeout(r, 30));
    }

    this.isFlushingQueue = false;
  }

  async _executeCommand(commandId, payload = [], timeoutMs = 1500) {
    const buffer = new Uint8Array(32);
    buffer[0] = commandId;
    for (let i = 0; i < payload.length && i < 31; i++) {
      buffer[i + 1] = payload[i];
    }

    const expectedPrefix = [commandId, ...payload];

    const responsePromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.waitingResolvers.findIndex(r => r.resolve === resolve);
        if (idx !== -1) this.waitingResolvers.splice(idx, 1);
        reject(new Error(`Timeout ao aguardar resposta do comando 0x${commandId.toString(16)} [${payload.join(',')}]`));
      }, timeoutMs);

      this.waitingResolvers.push({
        expectedPrefix,
        resolve: (data) => {
          clearTimeout(timer);
          resolve(data);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        }
      });
    });

    // Small breather before writing to USB endpoint
    await new Promise(r => setTimeout(r, 15));

    // Send report with retry handling in case USB endpoint is momentarily busy (e.g. during flash write)
    let sendError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.device.sendReport(0, buffer);
        sendError = null;
        break;
      } catch (err) {
        sendError = err;
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 60));
        }
      }
    }

    if (sendError) {
      // Remove resolver since write failed
      const idx = this.waitingResolvers.findIndex(r => r.resolve === resolve);
      if (idx !== -1) this.waitingResolvers.splice(idx, 1);
      throw sendError;
    }

    return await responsePromise;
  }

  // --- QMK VIA Methods ---

  async getProtocolVersion() {
    try {
      const res = await this.sendCommand(CMD.GET_PROTOCOL_VERSION);
      return (res[1] << 8) | res[2];
    } catch (err) {
      return 9;
    }
  }

  async getLayerCount() {
    try {
      const res = await this.sendCommand(CMD.GET_LAYER_COUNT);
      return res[1] || 2;
    } catch (err) {
      return 2;
    }
  }

  async getKey(layer, row, col) {
    const res = await this.sendCommand(CMD.GET_SET_KEY, [layer, row, col]);
    return (res[4] << 8) | res[5];
  }

  async setKey(layer, row, col, keycode) {
    const high = (keycode >> 8) & 0xFF;
    const low = keycode & 0xFF;
    await this.sendCommand(CMD.GET_SET_KEY, [layer, row, col, high, low]);
  }

  async getKeymapBuffer(offset, length) {
    const offsetHigh = (offset >> 8) & 0xFF;
    const offsetLow = offset & 0xFF;
    const res = await this.sendCommand(CMD.GET_KEYMAP_BUFFER, [offsetHigh, offsetLow, length]);
    return Array.from(res.slice(4, 4 + length));
  }

  async readKeymap(layer, rows, cols) {
    const totalKeys = rows * cols;
    const keymap = [];
    const offsetBase = layer * totalKeys * 2;

    for (let i = 0; i < totalKeys; i += 14) {
      const count = Math.min(14, totalKeys - i);
      const bytes = await this.getKeymapBuffer(offsetBase + (i * 2), count * 2);
      for (let j = 0; j < count; j++) {
        const high = bytes[j * 2];
        const low = bytes[j * 2 + 1];
        keymap.push((high << 8) | low);
      }
    }
    return keymap;
  }

  // --- Lighting Methods ---

  async saveLighting() {
    try {
      await this.sendCommand(CMD.SAVE_LIGHTING, [3], 800);
      console.log('[K742B] Configuração de iluminação gravada na EEPROM do hardware via comando [9, 3].');
    } catch (err) {
      console.warn('[K742B] Aviso ao salvar EEPROM (prosseguindo):', err.message);
    }
  }

  async getLightingState() {
    const state = {
      mode: 31, // Default fallback if undetected
      brightness: 120,
      speed: 128,
      color: '#e53e3e',
      sleepTime: '5',
      rawDiagnostics: {}
    };

    console.log('[K742B] Iniciando leitura detalhada dos parâmetros de iluminação...');

    // 1. Query RGB Mode: [8, 3, 2]
    try {
      const res32 = await this.sendCommand(CMD.GET_LIGHTING, [3, 2], 800);
      state.rawDiagnostics['8_3_2'] = Array.from(res32.slice(0, 10));
      if (res32 && res32[3] !== undefined && res32[3] >= 0 && res32[3] <= 44) {
        state.mode = res32[3];
        console.log(`[K742B] Modo RGB detectado: #${state.mode}`);
      }
    } catch (e32) {
      console.warn('[K742B] Falha ao consultar [8, 3, 2]:', e32.message);
      state.rawDiagnostics['8_3_2_err'] = e32.message;
    }

    // 2. Query Brightness: [8, 3, 1]
    try {
      const resBri = await this.sendCommand(CMD.GET_LIGHTING, [3, 1], 800);
      state.rawDiagnostics['8_3_1'] = Array.from(resBri.slice(0, 10));
      if (resBri && resBri[3] !== undefined) {
        state.brightness = resBri[3];
      }
    } catch (eBri) {
      state.rawDiagnostics['8_3_1_err'] = eBri.message;
    }

    // 3. Query Speed: [8, 3, 3]
    try {
      const resSpeed = await this.sendCommand(CMD.GET_LIGHTING, [3, 3], 800);
      state.rawDiagnostics['8_3_3'] = Array.from(resSpeed.slice(0, 10));
      if (resSpeed && resSpeed[3] !== undefined && resSpeed[3] >= 51) {
        state.speed = resSpeed[3];
      }
    } catch (eSpeed) {
      state.rawDiagnostics['8_3_3_err'] = eSpeed.message;
    }

    // 4. Query Color: [8, 3, 4]
    try {
      const resColor = await this.sendCommand(CMD.GET_LIGHTING, [3, 4], 800);
      state.rawDiagnostics['8_3_4'] = Array.from(resColor.slice(0, 10));
      if (resColor && resColor[3] !== undefined && resColor[4] !== undefined) {
        state.color = hsvToHex(resColor[3], resColor[4], state.brightness);
      }
    } catch (eColor) {
      state.rawDiagnostics['8_3_4_err'] = eColor.message;
    }

    // 5. Query Sleep Timeout: [8, 0, 1]
    try {
      const resSleep = await this.sendCommand(CMD.GET_LIGHTING, [0, 1], 800);
      state.rawDiagnostics['8_0_1'] = Array.from(resSleep.slice(0, 10));
      if (resSleep && resSleep[3] !== undefined) {
        state.sleepTime = String(resSleep[3]);
      }
    } catch {}

    console.log('[K742B] Estado final de iluminação detectado:', state);
    return state;
  }

  async getRGBMode() {
    const res = await this.sendCommand(CMD.GET_LIGHTING, [3, 2]);
    return res[3];
  }

  async setRGBMode(mode, save = true) {
    await this.sendCommand(CMD.SET_LIGHTING, [3, 2, mode]);
    if (save) {
      await this.saveLighting();
    }
  }

  async getBrightness() {
    const res = await this.sendCommand(CMD.GET_LIGHTING, [3, 1]);
    return res[3];
  }

  async setBrightness(value, save = true) {
    const val = Math.max(0, Math.min(180, value));
    await this.sendCommand(CMD.SET_LIGHTING, [3, 1, val]);
    if (save) {
      await this.saveLighting();
    }
  }

  async getSpeed() {
    const res = await this.sendCommand(CMD.GET_LIGHTING, [3, 3]);
    return res[3];
  }

  async setSpeed(value, save = true) {
    const val = Math.max(51, Math.min(255, value));
    await this.sendCommand(CMD.SET_LIGHTING, [3, 3, val]);
    if (save) {
      await this.saveLighting();
    }
  }

  async getColor() {
    const res = await this.sendCommand(CMD.GET_LIGHTING, [3, 4]);
    return { hue: res[3], sat: res[4] };
  }

  async setColor(hue, sat, save = true) {
    await this.sendCommand(CMD.SET_LIGHTING, [3, 4, hue, sat]);
    if (save) {
      await this.saveLighting();
    }
  }

  async setSleepTimeout(minutes, save = true) {
    await this.sendCommand(CMD.SET_LIGHTING, [0, 1, Number(minutes)]);
    if (save) {
      await this.saveLighting();
    }
  }

  async applyLighting({ mode, brightness, speed, hue, sat }) {
    if (!this.device || !this.device.opened) {
      throw new Error('Teclado não conectado.');
    }

    // 1. Set mode (if specified)
    if (mode !== undefined) {
      await this.setRGBMode(mode, false);
      await new Promise(r => setTimeout(r, 40));
    }

    // 2. Set brightness (if specified)
    if (brightness !== undefined) {
      await this.setBrightness(brightness, false);
      await new Promise(r => setTimeout(r, 40));
    }

    // 3. Set speed (if specified)
    if (speed !== undefined) {
      await this.setSpeed(speed, false);
      await new Promise(r => setTimeout(r, 40));
    }

    // 4. Set color (if specified)
    if (hue !== undefined && sat !== undefined) {
      await this.setColor(hue, sat, false);
      await new Promise(r => setTimeout(r, 40));
    }

    // 5. Short pause to let controller settle before committing to EEPROM flash
    await new Promise(r => setTimeout(r, 60));

    // 6. Single EEPROM commit: save lighting only
    await this.saveLighting();
  }

  // Alias for backward compatibility
  async applyLightingBatch(params) {
    return this.applyLighting(params);
  }

  // --- General Settings ---

  async resetEEPROM() {
    await this.sendCommand(CMD.RESET_EEPROM, [0xAA, 0x55]);
  }
}

export const qmkDriver = new QMKDriver();
