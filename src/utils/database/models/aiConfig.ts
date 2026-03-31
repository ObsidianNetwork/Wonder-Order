import mongoose from "mongoose";
import { AIConfigSchema } from "../schemas/aiConfigSchema";

const AIConfig = mongoose.models?.AIConfig ?? mongoose.model("AIConfig", AIConfigSchema);
export default AIConfig;
export type { IAIConfig } from "../schemas/aiConfigSchema";
