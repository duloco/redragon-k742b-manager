/**
 * Precise mapping between DOM KeyboardEvent.code and K742B layout key values.
 * Developed for Redragon K742B Manager by Scartzeut Inc.
 */

export const DOM_TO_K742B_KEYS = {
  // Letters (Exact match only - never loose substring)
  'KeyA': ['A'], 'KeyB': ['B'], 'KeyC': ['C'], 'KeyD': ['D'], 'KeyE': ['E'],
  'KeyF': ['F'], 'KeyG': ['G'], 'KeyH': ['H'], 'KeyI': ['I'], 'KeyJ': ['J'],
  'KeyK': ['K'], 'KeyL': ['L'], 'KeyM': ['M'], 'KeyN': ['N'], 'KeyO': ['O'],
  'KeyP': ['P'], 'KeyQ': ['Q'], 'KeyR': ['R'], 'KeyS': ['S'], 'KeyT': ['T'],
  'KeyU': ['U'], 'KeyV': ['V'], 'KeyW': ['W'], 'KeyX': ['X'], 'KeyY': ['Y'], 'KeyZ': ['Z'],

  // Number Row (distinct from numpad)
  'Backquote': ["' \"", "'", '"', '~`', '`'],
  'Digit1': ['!1', '1!'],
  'Digit2': ['@2', '2@'],
  'Digit3': ['#3', '3#'],
  'Digit4': ['$4', '4$'],
  'Digit5': ['%5', '5%'],
  'Digit6': ['^6', '6^', '6¨'],
  'Digit7': ['&7', '7&'],
  'Digit8': ['*8', '8*'],
  'Digit9': ['(9', '9('],
  'Digit0': [')0', '0)'],
  'Minus': ['_-', '-_', '-'],
  'Equal': ['+=', '=+', '='],
  'Backspace': ['Bksp', 'Backspace', '←'],

  // Function Keys (Exact match: F1..F12 only match their own key, never letter F or FN)
  'Escape': ['Esc', 'Escape'],
  'F1': ['F1'], 'F2': ['F2'], 'F3': ['F3'], 'F4': ['F4'],
  'F5': ['F5'], 'F6': ['F6'], 'F7': ['F7'], 'F8': ['F8'],
  'F9': ['F9'], 'F10': ['F10'], 'F11': ['F11'], 'F12': ['F12'],
  'Delete': ['Del', 'Delete'],
  'Insert': ['Ins', 'Insert'],
  'PageUp': ['PgUp', 'PageUp'],
  'PageDown': ['PgDn', 'PageDown'],

  // Modifiers
  'Tab': ['Tab'],
  'CapsLock': ['CAPS', 'CapsLk', 'CapsLock'],
  'Enter': ['Enter', 'iso-enter'],
  'ShiftLeft': ['LShft', 'Shift', '↑ Shift'],
  'ShiftRight': ['RShft', '/ ?', 'RO', 'Ro'],
  'ControlLeft': ['LCTL', 'Ctrl'],
  'ControlRight': ['RCtl', 'Ctrl'],
  'MetaLeft': ['LWin', 'Win'],
  'MetaRight': ['LWin', 'Win'],
  'OSLeft': ['LWin', 'Win'],
  'OSRight': ['LWin', 'Win'],
  'AltLeft': ['LAlt', 'Alt'],
  'AltRight': ['RAlt', 'AltGr', 'Alt'],
  'Space': ['Space', ' '],

  // Punctuation (ABNT2 & US International)
  'BracketLeft': ['´ `', '´', '`', '[{', '['],
  'BracketRight': ['[ {', '[{', '[', ']}', ']'],
  'Semicolon': ['Ç', 'ç', ':;', ';'],
  'Quote': ['~ ^', '~', '^', '”\'', "'"],
  'Backslash': ['] }', ']}', ']', '\\'],
  'IntlBackslash': ['\\ |', '\\|', '\\', '|', 'NUBS'],
  'Comma': ['<,', ',<', ','],
  'Period': ['>.', '.>', '.'],
  'Slash': ['; :', ':;', ';', '?/'],
  'IntlRo': ['/ ?', '?/', '/', 'RO', 'Ro'],

  // Navigation Arrows
  'ArrowUp': ['↑'],
  'ArrowDown': ['↓'],
  'ArrowLeft': ['←'],
  'ArrowRight': ['→'],

  // Numpad (distinct from top numbers)
  'NumLock': ['N.Lck', 'NumLock', 'Num'],
  'NumpadDivide': ['÷', '/'],
  'NumpadMultiply': ['*'],
  'NumpadSubtract': ['-'],
  'NumpadAdd': ['+'],
  'NumpadEnter': ['N.Ent'],
  'NumpadDecimal': ['.', ','],
  'Numpad0': ['0'],
  'Numpad1': ['1'],
  'Numpad2': ['2'],
  'Numpad3': ['3'],
  'Numpad4': ['4'],
  'Numpad5': ['5'],
  'Numpad6': ['6'],
  'Numpad7': ['7'],
  'Numpad8': ['8'],
  'Numpad9': ['9'],

  // Audio / Rotary Knob
  'AudioVolumeMute': ['Mute'],
  'AudioVolumeUp': ['Mute', 'Vol+', 'VolumeUp'],
  'AudioVolumeDown': ['Mute', 'Vol-', 'VolumeDown']
};

export const DOM_TO_K742B_MAP = Object.fromEntries(
  Object.entries(DOM_TO_K742B_KEYS).map(([code, arr]) => [code, arr[0]])
);

/**
 * Checks if a given layout key definition matches any currently pressed DOM codes
 */
export function isKeyActive(key, pressedCodesSet) {
  if (!key || !pressedCodesSet || pressedCodesSet.size === 0) return false;

  const keyVal = (key.value || '').trim();

  // 1. Direct code match
  if (pressedCodesSet.has(keyVal)) return true;

  // 2. Special ISO Enter match
  if (pressedCodesSet.has('Enter') && (keyVal === 'Enter' || key.shape === 'iso-enter')) {
    return true;
  }

  // 3. Special Numpad Enter match
  if (pressedCodesSet.has('NumpadEnter') && (keyVal === 'N.Ent' || (key.row === 4 && key.col === 17))) {
    return true;
  }

  // 4. Precise match against mapped allowed aliases
  for (const code of pressedCodesSet) {
    const validKeys = DOM_TO_K742B_KEYS[code];
    if (validKeys) {
      for (const expected of validKeys) {
        if (expected.toLowerCase() === keyVal.toLowerCase()) {
          return true;
        }
      }
    }
  }

  return false;
}
