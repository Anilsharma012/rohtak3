import mongoose, { Schema, Document } from 'mongoose';

export type MovementType = 'adjust' | 'transfer';

export interface IStockMovement extends Document {
  type: MovementType;
  productId: string;
  productName: string;
  batchNo: string;
  fromBatchId?: string;
  toBatchId?: string;
  qty: number;
  reason: string;
  userId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    type: { type: String, enum: ['adjust', 'transfer'], required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    batchNo: { type: String, required: true },
    fromBatchId: { type: String },
    toBatchId: { type: String },
    qty: { type: Number, required: true },
    reason: { type: String, required: true, trim: true },
    userId: { type: String, required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

StockMovementSchema.index({ productId: 1, createdAt: -1 });
StockMovementSchema.index({ type: 1, createdAt: -1 });

export const StockMovement = mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);
