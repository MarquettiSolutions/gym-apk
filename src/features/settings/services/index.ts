import { db, repositories } from '../../../db/client';
import { createSettingsService } from './settingsService';
import { createBackupService } from './backupService';

export * from './settingsService';
export * from './backupService';

export const settingsService = createSettingsService(repositories);
export const backupService = createBackupService(db, repositories);
