const path  = require('path');
const Event = require('../models/Event');
const Reservation = require('../models/Reservation');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Événement introuvable' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.filename;
    const event = new Event(data);
    const saved = await event.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.filename;
    const event = await Event.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: 'Événement introuvable' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Événement introuvable' });
    res.json({ message: 'Événement supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCapacity = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Événement introuvable' });
    const taken = await Reservation.countDocuments({
      'events.eventId': event._id,
      status: { $ne: 'cancelled' }
    });
    res.json({ capacity: event.capacity, taken, remaining: Math.max(0, event.capacity - taken) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const freeEvents  = await Event.countDocuments({ price: 0 });
    const paidEvents  = totalEvents - freeEvents;
    const totalReservations = await Reservation.countDocuments();

    const revenueAgg = await Reservation.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const byCategory = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({ totalEvents, freeEvents, paidEvents, totalReservations, totalRevenue, byCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
