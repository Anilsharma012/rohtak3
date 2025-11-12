import { connectDB } from '../src/db/connect';
import mongoose from 'mongoose';
import { Item } from '../src/models/Item';
import { User } from '../src/models/User';
import { Sale } from '../src/models/Sale';

const run = async () => {
  try {
    await connectDB();
    const admin = await User.findOne({ role: 'admin' }).lean();
    if (!admin) throw new Error('Admin user not found');

    const items = await Item.find().limit(3);
    if (!items || items.length === 0) throw new Error('No items found to create sale');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const lines: any[] = [];
      let subtotal = 0;
      for (const it of items) {
        if (!it.batches || it.batches.length === 0) continue;
        const b = it.batches[0];
        const qty = Math.min(2, b.onHand || 0);
        if (qty <= 0) continue;
        // decrement
        const itemDoc = await Item.findById(it._id).session(session);
        const idx = itemDoc.batches.findIndex(x => x.batchNo === b.batchNo);
        itemDoc.batches[idx].onHand = (itemDoc.batches[idx].onHand || 0) - qty;
        itemDoc.onHand = Math.max(0, (itemDoc.onHand || 0) - qty);
        await itemDoc.save({ session });

        const amount = Number((qty * (b.salePrice || it.salePrice || 0)).toFixed(2));
        lines.push({ productId: it._id, productName: it.name, batchNo: b.batchNo, expiryDate: b.expiryDate, qty, salePrice: b.salePrice || it.salePrice || 0, amount });
        subtotal += amount;
      }

      if (lines.length === 0) {
        await session.abortTransaction();
        session.endSession();
        console.log('No available stock to create sample sale');
        process.exit(0);
      }

      const billNo = `B-${Date.now()}`;
      const sale = await Sale.create([{ billNo, billDate: new Date(), customer: 'Walk-in', items: lines, subtotal: Number(subtotal.toFixed(2)), grandTotal: Number(subtotal.toFixed(2)), cashierId: admin._id }], { session });

      await session.commitTransaction();
      session.endSession();
      console.log('Sample sale created', sale[0]._id.toString());
      process.exit(0);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err) {
    console.error('Seed sales failed', err);
    process.exit(1);
  }
};

run();
