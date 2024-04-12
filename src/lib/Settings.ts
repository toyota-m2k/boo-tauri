import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';

export class Settings {
  private static readonly SETTINGS_FILE = 'settings.json';
  private static settings: Record<string, unknown> = {};

  public static async load(): Promise<void> {
    try {
      const settings = await readTextFile(Settings.SETTINGS_FILE);
      Settings.settings = JSON.parse(settings);
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  }

  public static async save(): Promise<void> {
    try {
      await writeTextFile(Settings.SETTINGS_FILE, JSON.stringify(Settings.settings));
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  }

  public static get<T>(key: string, defaultValue: T): T {
    return Settings.settings[key] as T ?? defaultValue;
  }

  public static set<T>(key: string, value: T): void {
    Settings.settings[key] = value;
  }
}