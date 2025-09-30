// client/src/hooks/useBrandConfig.js
import { useState, useEffect, useCallback } from 'react';
import { brandAPI } from '../lib/api';
import { STORAGE_KEYS } from '../lib/constants';

export function useBrandConfig() {
  const [brandConfig, setBrandConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [configId, setConfigId] = useState(null);

  const setAndSaveConfig = (newConfigId, newBrandConfig) => {
    setConfigId(newConfigId);
    setBrandConfig(newBrandConfig);
    localStorage.setItem(
      STORAGE_KEYS.BRAND_CONFIG,
      JSON.stringify({ configId: newConfigId, brandConfig: newBrandConfig })
    );
  };

  const createOrUpdateConfig = useCallback(async (configData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Si ya tenemos un ID, actualizamos. Si no, creamos.
      const response = configId
        ? await brandAPI.update(configId, configData)
        : await brandAPI.create(configData, 'manual');

      if (response.success) {
        const newId = configId || response.data.configId;
        const finalConfig = response.data.brandConfig || response.data;
        setAndSaveConfig(newId, finalConfig);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al guardar la configuración');
      }
    } catch (err) {
      console.error("Error en createOrUpdateConfig:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [configId]);

  const hasValidConfig = useCallback(() => {
    return brandConfig && brandConfig.colors && brandConfig.fonts;
  }, [brandConfig]);
  
  return {
    brandConfig,
    configId,
    isLoading,
    error,
    setBrandConfig: (config) => {
      // Cuando seteamos la config por primera vez (después de subir el PDF), no tenemos ID.
      // El ID se creará en el primer guardado.
      setConfigId(config.id || null); // El ID puede venir o no
      setBrandConfig(config);
    },
    createOrUpdateConfig,
    hasValidConfig
  };
}
