import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'Pending' | 'Fulfilled' | 'Canceled';

export interface ISalesOrderLine {
  productId: string;
  productName: string;
  batchNo?: string;
  qty: number;
  salePrice: number;
  amount: number;
}

export interface ISalesOrder extends Document {
  orderNo: string;
  orderDate: Date;
  customer?: string;
  status: OrderStatus;
  items: ISalesOrderLine[];
  totalAmount: number;
  createdBy?: string;
}

const SalesOrderLineSchema = new Schema<ISalesOrderLine>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    batchNo: { type: String },
    qty: { type: Number, required: true, min: 1 },
    salePrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const SalesOrderSchema = new Schema<ISalesOrder>(
  {
    orderNo: { type: String, required: true, unique: true, trim: true },
    orderDate: { type: Date, required: true },
    customer: { type: String },
    status: { type: String, enum: ['Pending','Fulfilled','Canceled'], default: 'Pending' },
    items: { type: [SalesOrderLineSchema], required: true, minlength: 1 },
    totalAmount: { type: Number, required: true, default: 0 },
    createdBy: { type: String },
  },
  { timestamps: true }
);

SalesOrderSchema.index({ orderNo: 1 });
SalesOrderSchema.index({ orderDate: -1 });

export const SalesOrder = mongoose.model<ISalesOrder>('SalesOrder', SalesOrderSchema);
