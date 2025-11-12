import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseReturnLine {
  productId: string;
  productName: string;
  batchNo: string;
  qty: number;
  purchasePrice: number;
  reason?: string;
}

export interface IPurchaseReturn extends Document {
  returnNo: string;
  refInvoiceId?: string;
  refInvoiceNo?: string;
  supplier?: string;
  returnDate: Date;
  totalAmount: number;
  reason?: string;
  lines: IPurchaseReturnLine[];
  createdBy: string;
}

const PurchaseReturnLineSchema = new Schema<IPurchaseReturnLine>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    batchNo: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    purchasePrice: { type: Number, required: true, min: 0 },
    reason: { type: String },
  },
  { _id: false }
);

const PurchaseReturnSchema = new Schema<IPurchaseReturn>(
  {
    returnNo: { type: String, required: true, trim: true, unique: true },
    refInvoiceId: { type: String },
    refInvoiceNo: { type: String },
    supplier: { type: String },
    returnDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true, default: 0 },
    reason: { type: String },
    lines: { type: [PurchaseReturnLineSchema], required: true, minlength: 1 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

PurchaseReturnSchema.index({ returnNo: 1 });
PurchaseReturnSchema.index({ returnDate: -1 });

export const PurchaseReturn = mongoose.model<IPurchaseReturn>('PurchaseReturn', PurchaseReturnSchema);
