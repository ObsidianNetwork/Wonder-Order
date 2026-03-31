import mongoose from "mongoose";
import { TableSchema } from "../schemas/tableSchema";

export const Tables = mongoose.models?.tables ?? mongoose.model("tables", TableSchema);
export type { TTable } from "../schemas/tableSchema";
