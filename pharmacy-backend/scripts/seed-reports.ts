import { connectDB } from '../src/db/connect';
import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Settings } from '../src/models/Settings';
import { Item } from '../src/models/Item';
import { GRN } from '../src/models/GRN';
import { Sale } from '../src/models/Sale';
import { PurchaseInvoice } from '../src/models/PurchaseInvoice';
import { RecallNotice, ControlledLog } from '../src/models/compliance.models';

const run = async () => {
  try {
    await connectDB();

    // create settings if none
    let s = await Settings.findOne();
    if (!s) {
      s = await Settings.create({ inventory: { nearExpiryDays: 90, dispensingMethod: 'FEFO', negativeStock: 'Warn', leadTimeDays: 7, minStockDefault: 5 }, billing: { defaultGST: 5, roundOff: 'nearest1' } });
      console.log('Created default settings');
    }

    // create users
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const bcrypt = require('bcryptjs');
      const hashed = bcrypt.hashSync('admin@123', 10);
      await User.create({ name: 'Admin', email: 'admin@gmail.com', password: hashed, role: 'admin' });
      console.log('Created admin user');
    }
    const cashierCount = await User.countDocuments({ role: 'cashier' });
    if (cashierCount === 0) {
      const bcrypt = require('bcryptjs');
      const hashed = bcrypt.hashSync('cashier@123', 10);
      await User.create({ name: 'Cashier', email: 'cashier@gmail.com', password: hashed, role: 'cashier' });
      console.log('Created cashier user');
    }

    // create sample items and GRN
    const itemsData = [
      { name: 'Paracetamol 500mg', sku: 'PCM500', unit: 'tablet', mrp: 20, purchasePrice: 12, salePrice: 18, minStock: 10, isControlled: false },
      { name: 'Morphine 10mg', sku: 'MOR10', unit: 'tablet', mrp: 150, purchasePrice: 90, salePrice: 130, minStock: 5, isControlled: true },
      { name: 'Cough Syrup 100ml', sku: 'CS100', unit: 'ml', mrp: 80, purchasePrice: 50, salePrice: 75, minStock: 5, isControlled: false },
    ];

    const created: any[] = [];
    for (const it of itemsData) {
      let item = await Item.findOne({ sku: it.sku });
      if (!item) {
        item = await Item.create({ ...it, onHand: 0, batches: [] });
        console.log('Created item', item.name);
      }
      created.push(item);
    }

    // GRN with batches
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const grnLines: any[] = [];
      for (const it of created) {
        const batchNo = `BATCH-${Math.floor(Math.random()*9000)+1000}`;
        const qty = 200;
        const freeQty = 0;
        const itemDoc = await Item.findById(it._id).session(session);
        itemDoc.batches.push({ batchNo, expiryDate: new Date(Date.now() + 365*24*60*60*1000), onHand: qty, mrp: it.mrp, purchasePrice: it.purchasePrice, salePrice: it.salePrice });
        itemDoc.onHand = (itemDoc.onHand || 0) + qty;
        if ((it as any).isControlled) itemDoc.isControlled = true;
        await itemDoc.save({ session });
        grnLines.push({ productId: itemDoc._id, productName: itemDoc.name, batchNo, expiryDate: new Date(), qty, freeQty, purchasePrice: itemDoc.purchasePrice, mrp: itemDoc.mrp, salePrice: itemDoc.salePrice });
      }

      const grn = await GRN.create([{ invoiceNo: `INV-${Date.now()}`, invoiceDate: new Date(), vendor: 'Seed Vendor', lines: grnLines, createdBy: 'seed' }], { session });
      const purchase = await PurchaseInvoice.create([{ invoiceNo: `INV-${Date.now()}`, vendor: 'Seed Vendor', invoiceDate: new Date(), totalAmount: grnLines.reduce((a,b)=>a+(b.qty*b.purchasePrice),0), status: 'posted', grnId: grn[0]._id, createdBy: 'seed' }], { session });

      await session.commitTransaction();
      session.endSession();
      console.log('Seed GRN & purchase created');
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }

    // Create sample sales across dates
    const salesSession = await mongoose.startSession();
    salesSession.startTransaction();
    try {
      const items = await Item.find().session(salesSession);
      for (let i=1;i<=5;i++) {
        const lines: any[] = [];
        let subtotal = 0;
        for (const it of items) {
          if (!it.batches || it.batches.length===0) continue;
          const b = it.batches[0];
          const qty = Math.min(5, b.onHand || 0);
          if (qty<=0) continue;
          const itemDoc = await Item.findById(it._id).session(salesSession);
          const idx = itemDoc.batches.findIndex(x=>x.batchNo===b.batchNo);
          itemDoc.batches[idx].onHand = (itemDoc.batches[idx].onHand || 0) - qty;
          itemDoc.onHand = Math.max(0, (itemDoc.onHand || 0) - qty);
          await itemDoc.save({ session: salesSession });
          const amount = Number((qty * (b.salePrice || it.salePrice || 0)).toFixed(2));
          lines.push({ productId: it._id, productName: it.name, batchNo: b.batchNo, expiryDate: b.expiryDate, qty, salePrice: b.salePrice || it.salePrice || 0, amount });
          subtotal += amount;
        }
        if (lines.length===0) continue;
        const sale = await Sale.create([{ billNo: `B-${Date.now()}-${i}`, billDate: new Date(Date.now()-i*24*60*60*1000), customer: 'Walk-in', items: lines, subtotal: Number(subtotal.toFixed(2)), grandTotal: Number(subtotal.toFixed(2)), cashierId: 'seed' }], { session: salesSession });
      }
      await salesSession.commitTransaction();
      salesSession.endSession();
      console.log('Sample sales created');
    } catch (err) {
      await salesSession.abortTransaction();
      salesSession.endSession();
      throw err;
    }

    // Create a recall for one product batch
    const oneItem = await Item.findOne().lean();
    if (oneItem && oneItem.batches && oneItem.batches[0]) {
      await RecallNotice.create({ productId: oneItem._id, batchNo: oneItem.batches[0].batchNo, status: 'Active', notes: 'Seed recall' });
      console.log('Created sample recall for', oneItem.name);
    }

    // Controlled logs: create example
    const controlledItems = await Item.find({ isControlled: true }).lean();
    for (const ci of controlledItems) {
      if (ci.batches && ci.batches[0]) {
        await ControlledLog.create({ productId: ci._id, batchNo: ci.batches[0].batchNo, type: 'IN', qty: 100, actor: 'seed' });
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
};

run();
