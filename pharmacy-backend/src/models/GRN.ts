import mongoose, { Schema, Document } from 'mongoose';

export interface IGRNLine {
  productId: string;
  productName: string;
  batchNo: string;
  expiryDate?: Date;
  qty: number;
  freeQty: number;
  purchasePrice: number;
  mrp?: number;
  salePrice?: number;
}

export interface IGRN extends Document {
  invoiceNo: string;
  invoiceDate: Date;
  vendor?: string;
  lines: IGRNLine[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const GRNLineSchema = new Schema<IGRNLine>(
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

const GRNSchema = new Schema<IGRN>(
  {
    invoiceNo: { type: String, required: true, unique: true, trim: true },
    invoiceDate: { type: Date, required: true },
    vendor: { type: String, trim: true },
    lines: { type: [GRNLineSchema], required: true, minlength: 1 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

GRNSchema.index({ invoiceNo: 1 });
GRNSchema.index({ invoiceDate: -1 });

export const GRN = mongoose.model<IGRN>('GRN', GRNSchema);
