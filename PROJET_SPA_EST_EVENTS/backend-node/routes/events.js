const express  = require('express');
const { body, validationResult } = require('express-validator');
const router   = express.Router();
const ctrl     = require('../controllers/eventController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload   = require('../middleware/upload');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

router.get('/',               ctrl.getAllEvents);
router.get('/stats',          ctrl.getStats);
router.get('/:id/capacity',   ctrl.getCapacity);
router.get('/:id',            ctrl.getEventById);

router.post('/',
  authenticate, requireAdmin, upload.single('image'),
  body('title').trim().notEmpty().withMessage('Titre requis'),
  body('date').isISO8601().withMessage('Date invalide'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacité invalide'),
  body('category').optional().isIn(['tech','culture','sport','science','music','autre']),
  validate,
  ctrl.createEvent
);

router.put('/:id',
  authenticate, requireAdmin, upload.single('image'),
  body('title').optional().trim().notEmpty().withMessage('Titre requis'),
  body('date').optional().isISO8601().withMessage('Date invalide'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacité invalide'),
  body('category').optional().isIn(['tech','culture','sport','science','music','autre']),
  validate,
  ctrl.updateEvent
);

router.delete('/:id', authenticate, requireAdmin, ctrl.deleteEvent);

module.exports = router;
