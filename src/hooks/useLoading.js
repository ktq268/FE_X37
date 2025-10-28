import { useState, useCallback } from 'react';

const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingText, setLoadingText] = useState('Đang tải...');

  const startLoading = useCallback((text = 'Đang tải...') => {
    setLoadingText(text);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingText('Đang tải...');
  }, []);

  const withLoading = useCallback(async (asyncFunction, loadingText = 'Đang tải...') => {
    try {
      startLoading(loadingText);
      const result = await asyncFunction();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    withLoading
  };
};

export { useLoading };
export default useLoading;
