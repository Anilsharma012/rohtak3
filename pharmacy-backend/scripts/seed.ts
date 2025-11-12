import { connectDB } from '../src/db/connect';
import mongoose from 'mongoose';
import { Item } from '../src/models/Item';
import { User } from '../src/models/User';
import { GRN } from '../src/models/GRN';
import { PurchaseInvoice } from '../src/models/PurchaseInvoice';

const run = async () => {
  try {
    await connectDB();

    // Create admin user if none
    const userCount = await User.countDocuments();
    let admin: any = null;
    if (userCount === 0) {
      const bcrypt = await import('bcryptjs');
      const hashed = await bcrypt.hash('admin@123', 10);
      admin = await User.create({ name: 'Admin', email: 'admin@gmail.com', password: hashed, role: 'admin' });
      console.log('Created admin user:', admin.email);
    } else {
      admin = await User.findOne({ role: 'admin' }).lean();
      if (admin) console.log('Found existing admin:', admin.email);
      else console.log('Admin exists but could not find user doc');
    }

    // Add sample items
    const itemsToCreate = [
      { name: 'Paracetamol 500mg', sku: 'PCM500', unit: 'tablet', mrp: 20, purchasePrice: 12, salePrice: 18, minStock: 10 },
      { name: 'Cough Syrup 100ml', sku: 'COUGH100', unit: 'ml', mrp: 80, purchasePrice: 50, salePrice: 75, minStock: 5 },
      { name: 'Amoxicillin 250mg', sku: 'AMOX250', unit: 'capsule', mrp: 30, purchasePrice: 20, salePrice: 28, minStock: 8 },
    ];

    const created: any[] = [];
    for (const it of itemsToCreate) {
      let item = await Item.findOne({ sku: it.sku });
      if (!item) {
        item = await Item.create({ ...it, onHand: 0, batches: [] });
        console.log('Created item', item.name);
      } else {
        console.log('Item exists', item.name);
      }
      created.push(item);
    }

    // Create a purchase (with GRN) and add batches atomically
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const invoiceNo = `INV-${Date.now()}`;
      const invoiceDate = new Date();
      const vendor = 'Sample Vendor Pvt Ltd';
      const userId = admin?._id || (admin && admin._id) || 'seed';

      const grnLines: any[] = [];
      let invoiceTotal = 0;

      // Add batches for each created item
      for (const item of created) {
        const batchNo = `BATCH-${Math.floor(Math.random() * 9000) + 1000}`;
        const qty = 100;
        const freeQty = 0;
        const purchasePrice = item.purchasePrice || 0;
        const mrp = item.mrp || undefined;
        const salePrice = item.salePrice || undefined;

        // update item
        const itDoc = await Item.findById(item._id).session(session);
        const totalQty = qty + freeQty;
        itDoc.batches.push({ batchNo, expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), onHand: totalQty, mrp, purchasePrice, salePrice });
        itDoc.onHand = (itDoc.onHand || 0) + totalQty;
        await itDoc.save({ session });

        grnLines.push({ productId: itDoc._id, productName: itDoc.name, batchNo, expiryDate: new Date(), qty, freeQty, purchasePrice, mrp, salePrice });
        invoiceTotal += qty * purchasePrice;
      }

      const grn = await GRN.create([{ invoiceNo, invoiceDate, vendor, lines: grnLines, createdBy: userId }], { session });
      const grnDoc = grn[0];

      const purchase = await PurchaseInvoice.create([{ invoiceNo, vendor, invoiceDate, totalAmount: Number(invoiceTotal.toFixed(2)), status: 'posted', grnId: grnDoc._id, createdBy: userId }], { session });

      await session.commitTransaction();
      session.endSession();

      console.log('Seed purchase created:', purchase[0]._id.toString());
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
};

run();
