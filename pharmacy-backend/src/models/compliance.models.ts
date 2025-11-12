import mongoose, { Schema, Document } from 'mongoose';

export interface IControlledLog extends Document {
  productId: string;
  batchNo?: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  qty: number;
  actor?: string;
  reason?: string;
  createdAt: Date;
}

export interface IRecallNotice extends Document {
  productId: string;
  batchNo: string;
  status: 'Active' | 'Closed';
  notes?: string;
  createdAt: Date;
}

const ControlledLogSchema = new Schema<IControlledLog>(
  {
    productId: { type: String, required: true },
    batchNo: { type: String },
    type: { type: String, enum: ['IN','OUT','ADJUST'], required: true },
    qty: { type: Number, required: true },
    actor: { type: String },
    reason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const RecallNoticeSchema = new Schema<IRecallNotice>(
  {
    productId: { type: String, required: true },
    batchNo: { type: String, required: true },
    status: { type: String, enum: ['Active','Closed'], default: 'Active' },
    notes: { type: String },
  },
  { timestamps: true }
);

export const ControlledLog = mongoose.model<IControlledLog>('ControlledLog', ControlledLogSchema);
export const RecallNotice = mongoose.model<IRecallNotice>('RecallNotice', RecallNoticeSchema);
