import mongoose, { Schema, Document } from "mongoose";

export interface IPunchRecord extends Document {
  userId: mongoose.Types.ObjectId;
  punchIn: Date;
  punchOut: Date | null;
  date: string; // YYYY-MM-DD
}

const PunchRecordSchema = new Schema<IPunchRecord>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  punchIn: { type: Date, required: true },
  punchOut: { type: Date, default: null },
  date: { type: String, required: true },
});

PunchRecordSchema.index({ userId: 1, date: 1 });

export default mongoose.models.PunchRecord ||
  mongoose.model<IPunchRecord>("PunchRecord", PunchRecordSchema);
