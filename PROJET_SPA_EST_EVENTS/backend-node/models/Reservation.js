const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  studentName:  { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, trim: true, lowercase: true },
  events: [{
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    title:   { type: String },
    price:   { type: Number }
  }],
  total:    { type: Number, default: 0 },
  status:   { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);
