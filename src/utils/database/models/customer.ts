import mongoose from "mongoose";
import { CustomerSchema } from "../schemas/customerSchema";

export const Customers = mongoose.models?.customers ?? mongoose.model("customers", CustomerSchema);
export type { TCustomer } from "../schemas/customerSchema";
