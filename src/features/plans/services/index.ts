import { repositories } from '../../../db/client';
import { createPlansService } from './plansService';

export * from './plansService';

// Instancia única sobre la DB real de la app — las pantallas/hooks de este
// feature la usan directo, igual que `repositories` en `db/client`.
export const plansService = createPlansService(repositories);
