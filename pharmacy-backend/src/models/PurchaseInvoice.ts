import mongoose, { Schema, Document } from 'mongoose';

export type PurchaseStatus = 'draft' | 'posted' | 'cancelled';

export interface IPurchaseLine {
  productId: string;
  productName: string;
  batchNo: string;
  expiryDate?: Date;
  qty: number;
  freeQty?: number;
  purchasePrice: number;
  mrp?: number;
  salePrice?: number;
}

export interface IPurchaseInvoice extends Document {
  invoiceNo: string;
  vendor?: string;
  invoiceDate: Date;
  totalAmount: number;
  status: PurchaseStatus;
  notes?: string;
  grnId?: string;
  createdBy: string;
}

const PurchaseLineSchema = new Schema<IPurchaseLine>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    batchNo: { type: String, required: true },
    expiryDate: { type: Date },
    qty: { type: Number, required: true, min: 1 },
    freeQty: { type: Number, default: 0, min: 0 },
    purchasePrice: { type: Number, required: true, min: 0 },
    mrp: { type: Number },
    salePrice: { type: Number },
  },
  { _id: false }
);

const PurchaseSchema = new Schema<IPurchaseInvoice>(
  {
    invoiceNo: { type: String, required: true, trim: true, unique: true },
    vendor: { type: String, trim: true },
    invoiceDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['draft','posted','cancelled'], default: 'draft' },
    notes: { type: String },
    grnId: { type: String },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

PurchaseSchema.index({ invoiceNo: 1 });
PurchaseSchema.index({ invoiceDate: -1 });

export const PurchaseInvoice = mongoose.model<IPurchaseInvoice>('PurchaseInvoice', PurchaseSchema);
