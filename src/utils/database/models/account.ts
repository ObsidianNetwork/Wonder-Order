import mongoose from "mongoose";
import { AccountSchema } from "../schemas/accountSchema";

// Legacy model on default connection - will be replaced by tenant models in API routes
export const Accounts = mongoose.models?.accounts ?? mongoose.model("accounts", AccountSchema);
export type { TAccount } from "../schemas/accountSchema";
