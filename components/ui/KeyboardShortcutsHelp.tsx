'use client';

import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut';
import Button from './Button';

interface Shortcut {
  keys: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: '⌘N / Win+N', description: 'Add new item' },
  { keys: '⌘H / Win+H', description: 'Toggle hide completed items' },
  { keys: '⌘S / Win+S', description: 'Toggle selection mode' },
  { keys: 'Esc', description: 'Close modal or panel' },
  { keys: '?', description: 'Show keyboard shortcuts' },
];

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut to toggle help
  useKeyboardShortcut(() => setIsOpen(!isOpen), {
    key: '?',
    shift: true,
    preventDefault: true,
  });

  return (
    <>
      {/* Floating help button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </Button>

      {/* Help modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
                      <Keyboard className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      Keyboard Shortcuts
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Shortcuts list */}
                <div className="space-y-3">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50"
                    >
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {shortcut.description}
                      </span>
                      <kbd className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-mono text-neutral-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
                  Press <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono dark:border-neutral-700 dark:bg-neutral-800">?</kbd> to toggle this dialog
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
