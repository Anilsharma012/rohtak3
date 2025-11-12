import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesReturnLine {
  productId: string;
  productName: string;
  batchNo: string;
  qty: number;
  salePrice: number;
  amount: number;
}

export interface ISalesReturn extends Document {
  returnNo: string;
  returnDate: Date;
  refBillId?: string;
  refBillNo?: string;
  customer?: string;
  totalAmount: number;
  reason?: string;
  lines: ISalesReturnLine[];
  createdBy?: string;
}

const SalesReturnLineSchema = new Schema<ISalesReturnLine>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    batchNo: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    salePrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const SalesReturnSchema = new Schema<ISalesReturn>(
  {
    returnNo: { type: String, required: true, unique: true, trim: true },
    returnDate: { type: Date, required: true },
    refBillId: { type: String },
    refBillNo: { type: String },
    customer: { type: String },
    totalAmount: { type: Number, required: true, default: 0 },
    reason: { type: String },
    lines: { type: [SalesReturnLineSchema], required: true, minlength: 1 },
    createdBy: { type: String },
  },
  { timestamps: true }
);

SalesReturnSchema.index({ returnNo: 1 });
SalesReturnSchema.index({ returnDate: -1 });

export const SalesReturn = mongoose.model<ISalesReturn>('SalesReturn', SalesReturnSchema);
