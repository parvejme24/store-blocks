import { TxContext } from "../../../shared-base/src/index.js";
import { Settings, UpdateSettingsInput } from "../shared/settings.schemas.js";
import { SettingsRepository } from "./settings.repository.js";

export class SettingsService {
  constructor(private readonly repo: SettingsRepository) {}

  async getSettings(tx?: TxContext): Promise<Settings> {
    return this.repo.get(tx);
  }

  async updateSettings(input: UpdateSettingsInput, tx?: TxContext): Promise<Settings> {
    return this.repo.update(input, tx);
  }
}

