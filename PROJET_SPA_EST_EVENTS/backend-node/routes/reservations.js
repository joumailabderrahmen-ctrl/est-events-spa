const express = require('express');
const { body, validationResult } = require('express-validator');
const router  = express.Router();
const ctrl    = require('../controllers/reservationController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

router.get('/', ctrl.getAllReservations);

router.post('/',
  body('studentName').trim().notEmpty().withMessage('Nom requis'),
  body('studentEmail').isEmail().withMessage('Email invalide'),
  body('events').isArray({ min: 1 }).withMessage('Au moins un événement requis'),
  validate,
  ctrl.createReservation
);

router.patch('/:id/cancel',  authenticate, ctrl.cancelReservation);
router.patch('/:id/confirm', authenticate, requireAdmin, ctrl.confirmReservation);

module.exports = router;
