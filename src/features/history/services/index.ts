import { repositories } from '../../../db/client';
import { createHistoryService } from './historyService';
import { createBodyWeightService } from './bodyWeightService';

export * from './historyService';
export * from './bodyWeightService';

export const historyService = createHistoryService(repositories);
export const bodyWeightService = createBodyWeightService(repositories);
