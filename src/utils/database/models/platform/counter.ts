import mongoose, { type HydratedDocument } from "mongoose";

const CounterSchema = new mongoose.Schema<TCounter>({
	name: { type: String, unique: true, required: true },
	seq: { type: Number, default: 0 },
});

export const Counters = mongoose.models?.counters ?? mongoose.model<TCounter>("counters", CounterSchema);

export async function getNextClientId(): Promise<string> {
	const counter = await Counters.findOneAndUpdate({ name: "clientId" }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: "after" });
	return `WO-${String(counter.seq).padStart(5, "0")}`;
}

export type TCounter = HydratedDocument<{
	name: string;
	seq: number;
}>;
