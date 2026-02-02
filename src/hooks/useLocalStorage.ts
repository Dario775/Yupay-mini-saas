import { useState, useEffect, useCallback } from 'react';

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

    // Retornar versión wrapeada de la función setter
    const setValue = useCallback((value: SetValue<T>) => {
        try {
            // Permitir que value sea una función para mantener la misma API que useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
                // Disparar evento para sincronización entre tabs
                window.dispatchEvent(new StorageEvent('storage', {
                    key,
                    newValue: JSON.stringify(valueToStore),
                }));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

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

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);

    return [storedValue, setValue];
}
