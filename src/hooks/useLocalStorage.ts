import { useState, useEffect, useCallback, useRef } from 'react';

type SetValue<T> = T | ((prevValue: T) => T);

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: SetValue<T>) => void] {
    // Estado para almacenar el valor
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Ref para mantener el valor más reciente y evitar clausuras obsoletas
    const lastValue = useRef<T>(storedValue);

    useEffect(() => {
        lastValue.current = storedValue;
    }, [storedValue]);

    // Retornar versión wrapeada de la función setter
    const setValue = useCallback((value: SetValue<T>) => {
        try {
            // Permitir que value sea una función para mantener la misma API que useState
            const nextValue = value instanceof Function ? value(lastValue.current) : value;

            // Sincronizar el ref inmediatamente para evitar colisiones en llamadas seguidas
            lastValue.current = nextValue;

            // Actualizar estado local
            setStoredValue(nextValue);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(nextValue));

                // Disparar evento para sincronización entre tabs
                window.dispatchEvent(new StorageEvent('storage', {
                    key,
                    newValue: JSON.stringify(nextValue),
                }));

                // Disparar evento personalizado para la misma ventana
                window.dispatchEvent(new CustomEvent('local-storage-update', {
                    detail: { key, newValue: nextValue }
                }));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key]);

    // Escuchar cambios en otras tabs/ventanas
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key && event.newValue) {
                try {
                    setStoredValue(JSON.parse(event.newValue));
                } catch (error) {
                    console.warn(`Error parsing storage event for key "${key}":`, error);
                }
            }
        };

        const handleCustomEvent = (event: any) => {
            if (event.detail.key === key) {
                setStoredValue(event.detail.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage-update', handleCustomEvent);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage-update', handleCustomEvent);
        };
    }, [key]);

    return [storedValue, setValue];
}
