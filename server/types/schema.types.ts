import type { Document, Types } from "mongoose";
import type {
  CategoryType,
  CurrencyType,
  FrequencyType,
  StatusType,
  UserRolesType,
} from "./common.types.ts";

export interface UserInterface {
  _id: Types.ObjectId;
  username: string;
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
  role: UserRolesType;
}

export interface SubscriptionInterface {
  user: Types.ObjectId | UserInterface;
  name: string;
  price: number;
  currency: CurrencyType;
  frequency: FrequencyType;
  category: CategoryType;
  paymentMethod: string;
  status: StatusType;
  startDate: Date;
  renewalDate: Date;
}
