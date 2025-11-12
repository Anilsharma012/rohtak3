import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'CREDIT';

export interface ISaleLine {
  productId: string;
  productName: string;
  batchNo: string;
  expiryDate?: Date;
  qty: number;
  salePrice: number;
  mrp?: number;
  gstPercent?: number;
  amount: number; // qty * salePrice
}

export interface ISale extends Document {
  billNo: string;
  billDate: Date;
  customer?: string;
  customerId?: string;
  items: ISaleLine[];
  subtotal: number;
  discount?: number;
  tax?: number;
  roundOff?: number;
  grandTotal: number;
  paymentMode?: PaymentMode;
  notes?: string;
  cashierId?: string;
}

const SaleLineSchema = new Schema<ISaleLine>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    batchNo: { type: String, required: true },
    expiryDate: { type: Date },
    qty: { type: Number, required: true, min: 1 },
    salePrice: { type: Number, required: true, min: 0 },
    mrp: { type: Number },
    gstPercent: { type: Number },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const SaleSchema = new Schema<ISale>(
  {
    billNo: { type: String, required: true, unique: true, trim: true },
    billDate: { type: Date, required: true },
    customer: { type: String },
    customerId: { type: String },
    items: { type: [SaleLineSchema], required: true, minlength: 1 },
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    roundOff: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    paymentMode: { type: String },
    notes: { type: String },
    cashierId: { type: String },
  },
  { timestamps: true }
);

SaleSchema.index({ billNo: 1 });
SaleSchema.index({ billDate: -1 });

export const Sale = mongoose.model<ISale>('Sale', SaleSchema);
