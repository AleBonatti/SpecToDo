'use client';

import { useEffect, useRef } from 'react';

export interface KeyboardShortcutOptions {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Command on Mac, Windows key on Windows
  preventDefault?: boolean;
  enabled?: boolean;
}

/**
 * Hook for registering keyboard shortcuts
 * @param callback - Function to execute when shortcut is triggered
 * @param options - Keyboard shortcut configuration
 */
export function useKeyboardShortcut(
  callback: () => void,
  options: KeyboardShortcutOptions
) {
  const callbackRef = useRef(callback);
  const { enabled = true } = options;

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Check if the pressed key matches
      if (event.key.toLowerCase() !== options.key.toLowerCase()) {
        return;
      }

      // Check modifier keys
      if (options.ctrl && !event.ctrlKey) return;
      if (options.alt && !event.altKey) return;
      if (options.shift && !event.shiftKey) return;
      if (options.meta && !event.metaKey) return;

      // Check that unwanted modifiers are not pressed
      if (!options.ctrl && event.ctrlKey) return;
      if (!options.alt && event.altKey) return;
      if (!options.shift && event.shiftKey) return;
      if (!options.meta && event.metaKey) return;

      // Prevent default behavior if specified
      if (options.preventDefault !== false) {
        event.preventDefault();
      }

      // Execute callback
      callbackRef.current();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, options]);
}

/**
 * Hook for registering multiple keyboard shortcuts at once
 * Note: Due to React Hooks rules, shortcuts array length must not change
 */
export function useKeyboardShortcuts(
  shortcuts: Array<{
    callback: () => void;
    options: KeyboardShortcutOptions;
  }>
) {
  const callbacksRef = useRef(shortcuts);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Check each shortcut
      for (const { callback, options } of callbacksRef.current) {
        if (options.enabled === false) continue;

        // Check if the pressed key matches
        if (event.key.toLowerCase() !== options.key.toLowerCase()) continue;

        // Check modifier keys
        if (options.ctrl && !event.ctrlKey) continue;
        if (options.alt && !event.altKey) continue;
        if (options.shift && !event.shiftKey) continue;
        if (options.meta && !event.metaKey) continue;

        // Check that unwanted modifiers are not pressed
        if (!options.ctrl && event.ctrlKey) continue;
        if (!options.alt && event.altKey) continue;
        if (!options.shift && event.shiftKey) continue;
        if (!options.meta && event.metaKey) continue;

        // Prevent default behavior if specified
        if (options.preventDefault !== false) {
          event.preventDefault();
        }

        // Execute callback
        callback();
        break; // Only execute first matching shortcut
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(options: KeyboardShortcutOptions): string {
  const parts: string[] = [];
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent);

  if (options.ctrl) parts.push(isMac ? '⌃' : 'Ctrl');
  if (options.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (options.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (options.meta) parts.push(isMac ? '⌘' : 'Win');
  parts.push(options.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
