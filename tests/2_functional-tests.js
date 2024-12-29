const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(5000); // 5 seconds timeout for each test

  // Test for viewing one stock
  test('Viewing one stock', function (done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.exists(res.body.stockData.price);
        done();
      });
  });

  // Test for viewing one stock and liking it
  test('Viewing one stock and liking it', function (done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.exists(res.body.stockData.price);
        assert.exists(res.body.stockData.likes);
        assert.equal(res.body.stockData.likes, 1); // First like
        done();
      });
  });

  // Test for viewing the same stock and liking it again
  test('Viewing the same stock and liking it again', function (done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.exists(res.body.stockData.price);
        assert.exists(res.body.stockData.likes);
        assert.equal(res.body.stockData.likes, 2); // Likes should now be 2
        done();
      });
  });

  // Test for viewing two stocks
  test('Viewing two stocks', function (done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'AAPL'] })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        assert.equal(res.body.stockData[0].stock, 'GOOG');
        assert.equal(res.body.stockData[1].stock, 'AAPL');
        done();
      });
  });

  // Test for viewing two stocks and liking them
  test('Viewing two stocks and liking them', function (done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'AAPL'], like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        assert.equal(res.body.stockData[0].stock, 'GOOG');
        assert.equal(res.body.stockData[1].stock, 'AAPL');
        assert.exists(res.body.stockData[0].likes);
        assert.exists(res.body.stockData[1].likes);
        assert.equal(res.body.stockData[0].likes, 1); // Like count should be 1 for each stock
        assert.equal(res.body.stockData[1].likes, 1);
        done();
      });
  });
});
