const { ObjectId } = require('mongodb');

class Order {
  constructor(db) {
    this.collection = db.collection('orders');
  }

  async create(orderData) {
    const result = await this.collection.insertOne({
      ...orderData,
      createdAt: new Date(),
      status: 'pending'
    });
    return result;
  }

  async findByUserId(userId) {
    return await this.collection.find({ userId: new ObjectId(userId) }).toArray();
  }
}

module.exports = Order;