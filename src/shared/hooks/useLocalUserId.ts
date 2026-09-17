import { useEffect, useState } from 'react';
import { repositories } from '../../db/client';

// El usuario local ya queda creado por `initDatabase()` antes de que la app
// muestre cualquier pantalla (ver `App.tsx`); este hook solo expone su id.
export function useLocalUserId(): string | undefined {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    let mounted = true;
    repositories.users.getOrCreateLocalUser().then(user => {
      if (mounted) {
        setUserId(user.id);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return userId;
}
