const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken, authenticate } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

/* POST /api/auth/register */
router.post('/register',
  body('name').trim().notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe min 6 caractères'),
  validate,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (await User.findOne({ email }))
        return res.status(409).json({ message: 'Email déjà utilisé' });
      const user  = await User.create({ name, email, password });
      const token = signToken(user);
      res.status(201).json({ token, user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* POST /api/auth/login */
router.post('/login',
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password)))
        return res.status(401).json({ message: 'Identifiants incorrects' });
      const token = signToken(user);
      res.json({ token, user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* GET /api/auth/me */
router.get('/me', authenticate, (req, res) => res.json(req.user));

module.exports = router;
