import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  organization: {
    name?: string;
    address?: string;
    gst?: string;
    license?: string;
    email?: string;
  };
  inventory: {
    dispensingMethod: 'FEFO' | 'FIFO' | 'LIFO';
    nearExpiryDays: number;
    negativeStock: 'Block' | 'Warn' | 'Allow';
    leadTimeDays: number;
    minStockDefault: number;
  };
  billing: {
    defaultGST: number;
    roundOff: 'nearest0.5' | 'nearest1' | 'none';
    printHeader?: string;
    printFooter?: string;
    whatsappTemplate?: string;
  };
}

const SettingsSchema = new Schema<ISettings>(
  {
    organization: {
      name: { type: String },
      address: { type: String },
      gst: { type: String },
      license: { type: String },
      email: { type: String },
    },
    inventory: {
      dispensingMethod: { type: String, enum: ['FEFO','FIFO','LIFO'], default: 'FEFO' },
      nearExpiryDays: { type: Number, default: 90 },
      negativeStock: { type: String, enum: ['Block','Warn','Allow'], default: 'Block' },
      leadTimeDays: { type: Number, default: 7 },
      minStockDefault: { type: Number, default: 0 },
    },
    billing: {
      defaultGST: { type: Number, default: 0 },
      roundOff: { type: String, enum: ['nearest0.5','nearest1','none'], default: 'none' },
      printHeader: { type: String },
      printFooter: { type: String },
      whatsappTemplate: { type: String },
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
