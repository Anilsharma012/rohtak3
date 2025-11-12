import fetch from 'node-fetch';

const run = async () => {
  try {
    const payload = {
      invoiceNo: `TEST-GRN-${Date.now()}`,
      invoiceDate: new Date().toISOString(),
      vendor: 'Test Vendor',
      lines: [
        // you must replace productId with one from your DB; script will try to fetch /api/items to pick one
      ],
    };

    // fetch items to pick a product
    const itemsRes = await fetch('http://127.0.0.1:500/api/items', { headers: { 'Content-Type': 'application/json' } });
    const itemsData = await itemsRes.json();
    if (!itemsData || !itemsData.data || itemsData.data.length === 0) {
      console.log('No items available to test GRN');
      process.exit(1);
    }
    const item = itemsData.data[0];
    const productId = item._id;
    const batchNo = `TESTB-${Math.floor(Math.random()*9000)+1000}`;

    payload.lines.push({ productId, batchNo, expiryDate: new Date(Date.now()+365*24*60*60*1000).toISOString(), qty: 10, freeQty: 0, purchasePrice: item.purchasePrice || 1, mrp: item.mrp || 0, salePrice: item.salePrice || 0 });

    const res = await fetch('http://127.0.0.1:500/api/grn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error', err);
  }
};

run();
