import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actor?: string;
  action: string;
  productId?: string;
  batchNo?: string;
  delta?: number;
  source?: string; // e.g., 'sale','grn','adjust','return'
  meta?: any;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: String },
    action: { type: String, required: true },
    productId: { type: String },
    batchNo: { type: String },
    delta: { type: Number },
    source: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
