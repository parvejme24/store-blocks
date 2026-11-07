import { TxContext } from "../../../shared-base/src/index.js";
import { Settings, UpdateSettingsInput } from "../shared/settings.schemas.js";

export interface SettingsRepository {
  get(tx?: TxContext): Promise<Settings>;
  update(input: UpdateSettingsInput, tx?: TxContext): Promise<Settings>;
}

