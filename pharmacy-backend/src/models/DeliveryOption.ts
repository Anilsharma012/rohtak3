import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryOption extends Document {
  name: string;
  fee: number;
  status: 'Enabled' | 'Disabled';
}

const DeliveryOptionSchema = new Schema<IDeliveryOption>(
  {
    name: { type: String, required: true, trim: true },
    fee: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['Enabled','Disabled'], default: 'Enabled' },
  },
  { timestamps: true }
);

DeliveryOptionSchema.index({ name: 1 });

export const DeliveryOption = mongoose.model<IDeliveryOption>('DeliveryOption', DeliveryOptionSchema);
