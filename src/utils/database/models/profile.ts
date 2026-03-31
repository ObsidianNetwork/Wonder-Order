import mongoose from "mongoose";
import { ProfileSchema } from "../schemas/profileSchema";

export const Profiles = mongoose.models?.profiles ?? mongoose.model("profiles", ProfileSchema);
export type { TProfile } from "../schemas/profileSchema";
