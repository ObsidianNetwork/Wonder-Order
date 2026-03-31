import mongoose from "mongoose";
import { OrderSchema } from "../schemas/orderSchema";

export const Orders = mongoose.models?.orders ?? mongoose.model("orders", OrderSchema);
export type { TOrder, TProduct } from "../schemas/orderSchema";
