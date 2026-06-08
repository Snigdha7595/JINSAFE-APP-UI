import { useState, useCallback } from 'react';

export function useModalManager<T extends string>(modalKeys: T[]) {
  const [modals, setModals] = useState<Record<T, boolean>>(Object.fromEntries(modalKeys.map((key) => [key, false])) as Record<T, boolean>);

  const openModal = useCallback((key: T) => {
    setModals((prev) => ({ ...prev, [key]: true }));
  }, []);

  const closeModal = useCallback((key: T) => {
    setModals((prev) => ({ ...prev, [key]: false }));
  }, []);

  return { modals, openModal, closeModal };
}
