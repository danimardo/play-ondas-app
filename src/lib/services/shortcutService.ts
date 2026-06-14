import { invoke } from '@tauri-apps/api/core';
import type { Shortcuts } from '../schemas/settingsSchema';

export interface ShortcutStatus {
  toggle: boolean;
  pause: boolean;
  stop: boolean;
}

/** Desregistra los atajos actuales y registra los nuevos. Devuelve el estado de cada uno. */
export async function applyShortcuts(shortcuts: Shortcuts): Promise<ShortcutStatus> {
  return invoke<ShortcutStatus>('apply_shortcuts', { shortcuts });
}

/** Consulta qué atajos tiene registrados esta app (sin modificarlos). */
export async function getShortcutStatus(shortcuts: Shortcuts): Promise<ShortcutStatus> {
  return invoke<ShortcutStatus>('get_shortcut_status', { shortcuts });
}

/** Convierte "ctrl+shift+p" → ["Ctrl", "Shift", "P"] para mostrar en la UI. */
export function shortcutToDisplayParts(shortcut: string): string[] {
  const LABELS: Record<string, string> = {
    ctrl: 'Ctrl', shift: 'Shift', alt: 'Alt', meta: '⌘', super: '⌘',
  };
  return shortcut.split('+').map(p => LABELS[p.toLowerCase()] ?? p.toUpperCase());
}

/** Captura un KeyboardEvent y devuelve la combinación en formato Tauri ("ctrl+shift+p"),
 *  o null si el evento es solo una tecla modificadora o no reconocida. */
export function captureShortcutFromEvent(event: KeyboardEvent): string | null {
  const MODIFIERS = ['Control', 'Alt', 'Shift', 'Meta'];
  if (MODIFIERS.includes(event.key)) return null;

  const parts: string[] = [];
  if (event.ctrlKey) parts.push('ctrl');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  if (event.metaKey) parts.push('super');

  if (parts.length === 0) return null; // sin modificador no sirve como atajo global

  const { code } = event;
  let key: string | null = null;

  if (code.startsWith('Key')) {
    key = code.slice(3).toLowerCase();           // KeyP → p
  } else if (code.startsWith('Digit')) {
    key = code.slice(5);                          // Digit1 → 1
  } else if (/^F\d+$/.test(code)) {
    key = code;                                   // F1 → F1
  } else {
    const extras: Record<string, string> = {
      Space: 'space', Enter: 'enter', Escape: 'escape',
      Backspace: 'backspace', Tab: 'tab',
      ArrowUp: 'arrowup', ArrowDown: 'arrowdown',
      ArrowLeft: 'arrowleft', ArrowRight: 'arrowright',
    };
    key = extras[code] ?? null;
  }

  if (!key) return null;
  parts.push(key);
  return parts.join('+');
}
