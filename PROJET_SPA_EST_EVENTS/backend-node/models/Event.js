const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  price:       { type: Number, default: 0, min: 0 },
  date:        { type: Date, required: true },
  location:    { type: String, default: '' },
  category:    { type: String, enum: ['tech', 'culture', 'sport', 'science', 'music', 'autre'], default: 'autre' },
  capacity:    { type: Number, default: 100 },
  createdAt:   { type: Date, default: Date.now }
});

eventSchema.virtual('isFree').get(function () {
  return this.price === 0;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
