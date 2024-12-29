'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');

// MongoDB schema and model
const stockSchema = new mongoose.Schema({
  stock: { type: String, required: true },
  likes: { type: Number, default: 0 },
  ipAddresses: { type: [String], default: [] },
});
const Stock = mongoose.model('Stock', stockSchema);

// Function to hash IP addresses
const hashIP = (ip) => crypto.createHash('sha256').update(ip).digest('hex');

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const { stock, like } = req.query;
      const ip = req.ip;
      const hashedIP = hashIP(ip);

      // Function to fetch stock data (dynamic import of node-fetch)
      const fetchStockData = async (ticker) => {
        try {
          const { default: fetch } = await import('node-fetch'); // dynamic import
          const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${ticker}/quote`);
          if (!response.ok) throw new Error('Failed to fetch stock data');
          const data = await response.json();
          if (!data.symbol || !data.latestPrice) throw new Error('Invalid stock data');
          return { stock: data.symbol, price: data.latestPrice };
        } catch (error) {
          console.error(error);
          return null;
        }
      };

      try {
        if (!stock) {
          return res.json({ error: 'Stock symbol is required' });
        }

        const stocks = Array.isArray(stock) ? stock : [stock];
        const results = [];

        for (let ticker of stocks) {
          const stockData = await fetchStockData(ticker);
          if (!stockData) {
            return res.json({ error: `Failed to retrieve data for ${ticker}` });
          }

          let stockRecord = await Stock.findOne({ stock: stockData.stock });

          if (!stockRecord) {
            stockRecord = new Stock({ stock: stockData.stock });
          }

          if (like === 'true' && !stockRecord.ipAddresses.includes(hashedIP)) {
            stockRecord.likes += 1;
            stockRecord.ipAddresses.push(hashedIP);
            await stockRecord.save();
          }

          results.push({
            stock: stockData.stock,
            price: stockData.price,
            likes: stockRecord.likes,
          });
        }

        if (results.length === 1) {
          res.json({ stockData: results[0] });
        } else {
          const likesDifference = results[0].likes - results[1].likes;
          res.json({
            stockData: [
              { ...results[0], rel_likes: likesDifference },
              { ...results[1], rel_likes: -likesDifference },
            ],
          });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
};
