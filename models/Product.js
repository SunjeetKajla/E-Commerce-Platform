const { ObjectId } = require('mongodb');

class Product {
  constructor(db) {
    this.collection = db.collection('products');
  }

  async getAll(filter = {}, search = '') {
    let query = {};
    if (filter.category) query.category = filter.category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    return await this.collection.find(query).toArray();
  }

  async findById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async seedProducts() {
    const count = await this.collection.countDocuments();
    if (count === 0) {
      await this.collection.insertMany([
        { name: 'Laptop', price: 4818, category: 'Electronics', description: 'High-performance laptop', image: 'http://localhost:3000/images/Laptop.jpg' },
        { name: 'Smartphone', price: 699, category: 'Electronics', description: 'Latest smartphone', image: 'https://via.placeholder.com/300x200?text=Phone' },
        { name: 'T-Shirt', price: 29, category: 'Clothing', description: 'Cotton t-shirt', image: 'https://via.placeholder.com/300x200?text=T-Shirt' },
        { name: 'Jeans', price: 79, category: 'Clothing', description: 'Denim jeans', image: 'https://via.placeholder.com/300x200?text=Jeans' },
        { name: 'Coffee Mug', price: 15, category: 'Home', description: 'Ceramic coffee mug', image: 'https://via.placeholder.com/300x200?text=Mug' },
        { name: 'Desk Lamp', price: 45, category: 'Home', description: 'LED desk lamp', image: 'https://via.placeholder.com/300x200?text=Lamp' }
      ]);
    }
  }
}

module.exports = Product;