import { useState, useEffect, useCallback } from 'react';

// FIX: Removed declare global block to resolve conflicting declaration error.
// The `window.aistudio` type is expected to be available globally from another definition file.

export const useVeoApiKey = () => {
  const [isKeyReady, setIsKeyReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkKey = useCallback(async () => {
    setIsChecking(true);
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsKeyReady(hasKey);
    } else {
      // If aistudio is not available, assume we are not in the right environment
      // and prevent key selection attempts.
      setIsKeyReady(false);
    }
    setIsChecking(false);
  }, []);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  const selectKey = useCallback(async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume key selection is successful and update state immediately
      // to avoid race conditions with `hasSelectedApiKey`.
      setIsKeyReady(true); 
    }
  }, []);
  
  const handleKeyError = useCallback(() => {
    setIsKeyReady(false);
  }, []);

  return { isKeyReady, isChecking, selectKey, handleKeyError };
};
