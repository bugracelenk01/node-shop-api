const mongoose = require('mongoose');
const Order = require('../modals/order');
const Product = require('../modals/product');

exports.orders_get_all = (req, res, next) => {
  Order
    .find()
    .select('product quantity _id')
    .populate('product')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            _id: doc._id,
            productId: doc.product,
            quantity: doc.quantity,
            requestOrder: {
              type: 'GET',
              url: 'http://localhost:3000/orders/' + doc._id
            },
            requestProduct: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + doc.product
            }
          }
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.orders_post_order = (req, res, next) => {
  //first checks if productId is in db if in db creates the order if it's not throwing error message.
  Product.findById(req.body.productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
      });
      return order.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'Order Created',
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders/' + result._id
        }
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.orders_gey_byId = (req, res, next) => {
  Order.findById(req.params.orderId)
    .select('quantity _id product')
    .populate('product', "_id name price")
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: 'Order not found with the provided id'
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders'
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};

exports.orders_delete_byId = (req, res, next) => {
  Order.remove({ _id: req.params.orderId })
    .exec()
    .then(order => {
      res.status(200).json({
        message: "Order Deleted",
        request: {
          type: 'POST',
          url: 'http://localhost:3000/orders',
          body: { productId: 'ID', quantity: 'Number' }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};