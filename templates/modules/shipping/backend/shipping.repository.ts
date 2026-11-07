import { TxContext } from "../../../shared-base/src/index.js";
import {
  ShippingZone,
  CreateShippingZoneInput,
  UpdateShippingZoneInput
} from "../shared/shipping.schemas.js";

export interface ShippingRepository {
  findMany(tx?: TxContext): Promise<ShippingZone[]>;
  findById(id: string, tx?: TxContext): Promise<ShippingZone | null>;
  findByName(name: string, tx?: TxContext): Promise<ShippingZone | null>;
  create(input: CreateShippingZoneInput, tx?: TxContext): Promise<ShippingZone>;
  update(id: string, input: UpdateShippingZoneInput, tx?: TxContext): Promise<ShippingZone | null>;
  delete(id: string, tx?: TxContext): Promise<boolean>;
}

