const Reservation = require('../models/Reservation');
const Event       = require('../models/Event');

exports.createReservation = async (req, res) => {
  try {
    const { events: items, studentName, studentEmail } = req.body;

    // capacity check for each event
    for (const item of items) {
      const event = await Event.findById(item.eventId);
      if (!event) return res.status(404).json({ message: `Événement ${item.eventId} introuvable` });

      const taken = await Reservation.countDocuments({
        'events.eventId': item.eventId,
        status: { $ne: 'cancelled' }
      });
      if (taken >= event.capacity)
        return res.status(400).json({ message: `Plus de places disponibles pour "${event.title}"` });
    }

    const reservation = new Reservation(req.body);
    const saved = await reservation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.email) filter.studentEmail = req.query.email.toLowerCase();
    const reservations = await Reservation.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable' });

    if (reservation.status === 'cancelled')
      return res.status(400).json({ message: 'Déjà annulée' });

    reservation.status = 'cancelled';
    await reservation.save();
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.confirmReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
