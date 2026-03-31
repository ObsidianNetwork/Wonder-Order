import mongoose from "mongoose";
import { KitchenSchema } from "../schemas/kitchenSchema";

export const Kitchens = mongoose.models?.kitchens ?? mongoose.model("kitchens", KitchenSchema);
export type { TKitchen } from "../schemas/kitchenSchema";
