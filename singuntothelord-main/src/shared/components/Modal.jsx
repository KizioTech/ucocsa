import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Modal = ({ isOpen, onClose, title, children }) => {
  const { darkMode } = useTheme();
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement;

      // Focus modal
      modalRef.current?.focus();

      // Trap focus
      const handleTab = (e) => {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }

        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      // Restore focus when modal closes
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg mx-auto p-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out scale-100 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className={`p-3 rounded-full transition duration-300 ease-in-out transform hover:scale-110 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;