import mongoose from "mongoose";
import { MenuSchema } from "../schemas/menuSchema";

export const Menus = mongoose.models?.menus ?? mongoose.model("menus", MenuSchema);
export type { TFoodType, TMenu, TVeg } from "../schemas/menuSchema";
