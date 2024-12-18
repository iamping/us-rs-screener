import { SettingsObject } from '../components/app/settings';

export const defaultSettings: SettingsObject = {
  includeOtc: false,
  includeBiotechnology: false
};

export const includeExchanges = ['NMS', 'NYQ', 'NGM', 'PCX', 'ASE', 'BTS', 'NCM'];

export const excludeIndustry = ['Biotechnology'];
