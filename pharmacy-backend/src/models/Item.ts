import mongoose, { Schema, Document } from 'mongoose';

export type Unit = 'tablet' | 'capsule' | 'ml' | 'gm' | 'syrup' | 'pack' | 'other';

export interface IItemBatch {
  batchNo: string;
  expiryDate?: Date;
  onHand: number;
  mrp?: number;
  purchasePrice?: number;
  salePrice?: number;
}

export interface IItem extends Document {
  name: string;
  sku?: string;
  hsn?: string;
  salt?: string;
  manufacturer?: string;
  unit: Unit;
  packSize?: string;
  barcode?: string;
  gstPercent?: number;
  mrp?: number;
  purchasePrice?: number;
  salePrice?: number;
  minStock?: number;
  onHand: number;
  notes?: string;
  batches: IItemBatch[];
}

const BatchSchema = new Schema<IItemBatch>(
  {
    batchNo: { type: String, required: true },
    expiryDate: { type: Date },
    onHand: { type: Number, default: 0 },
    mrp: { type: Number },
    purchasePrice: { type: Number },
    salePrice: { type: Number },
  },
  { _id: false }
);

const ItemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    sku: { type: String, sparse: true, unique: true },
    hsn: { type: String },
    salt: { type: String },
    manufacturer: { type: String },
    unit: { type: String, enum: ['tablet','capsule','ml','gm','syrup','pack','other'], default: 'other' },
    packSize: { type: String },
    barcode: { type: String },
    gstPercent: { type: Number, default: 0 },
    mrp: { type: Number },
    purchasePrice: { type: Number },
    salePrice: { type: Number },
    minStock: { type: Number, default: 0 },
    onHand: { type: Number, default: 0 },
    notes: { type: String },
    batches: { type: [BatchSchema], default: [] },
  },
  { timestamps: true }
);

ItemSchema.index({ name: 'text', salt: 'text', manufacturer: 'text' });

export const Item = mongoose.model<IItem>('Item', ItemSchema);
