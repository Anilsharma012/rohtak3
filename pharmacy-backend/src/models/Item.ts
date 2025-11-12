import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IItem extends Document {
  name: string;
  sku?: string;
  hsn?: string;
  salt?: string; // active ingredient
  manufacturer?: string;
  unit: 'tablet' | 'capsule' | 'ml' | 'gm' | 'syrup' | 'pack' | 'other';
  packSize?: string; // e.g., "10x10", "100ml"
  batchNo?: string;
  expiryDate?: Date;
  mrp?: number;
  purchasePrice?: number;
  salePrice?: number;
  gstPercent?: number;
  minStock?: number;
  barcode?: string;
  onHand: number;
  notes?: string;
}

const ItemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true, index: 'text' },
    sku: { type: String },
    hsn: { type: String },
    salt: { type: String },
    manufacturer: { type: String },
    unit: { type: String, enum: ['tablet','capsule','ml','gm','syrup','pack','other'], default: 'other' },
    packSize: { type: String },
    batchNo: { type: String },
    expiryDate: { type: Date },
    mrp: { type: Number },
    purchasePrice: { type: Number },
    salePrice: { type: Number },
    gstPercent: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    barcode: { type: String },
    onHand: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

ItemSchema.index({ name: "text", salt: "text", manufacturer: "text" });

export const Item = mongoose.model<IItem>('Item', ItemSchema);
