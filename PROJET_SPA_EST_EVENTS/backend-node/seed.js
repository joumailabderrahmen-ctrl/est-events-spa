require('dotenv').config();
const mongoose    = require('mongoose');
const Event       = require('./models/Event');
const User        = require('./models/User');
const Reservation = require('./models/Reservation');

// ── EVENTS ────────────────────────────────────────────────────────────────────
const events = [
  {
    title:       'Hackathon EST 2025',
    description: 'Compétition de 24h pour développer des solutions innovantes aux défis locaux. Équipes de 3-5 participants. Prix pour les 3 meilleures équipes.',
    image:       'event-1777865221641.png',
    price:       0,
    date:        new Date('2025-11-15T09:00:00'),
    location:    'Salle informatique A, EST Dakhla',
    category:    'tech',
    capacity:    60
  },
  {
    title:       'Soirée Culturelle Amazighe',
    description: 'Célébration de la richesse culturelle de la région. Musique, danse, gastronomie traditionnelle et exposition artisanale.',
    image:       'event-1777865189608.png',
    price:       30,
    date:        new Date('2025-11-22T18:00:00'),
    location:    'Amphithéâtre principal, EST Dakhla',
    category:    'culture',
    capacity:    200
  },
  {
    title:       'Tournoi de Football Inter-Filières',
    description: 'Tournoi annuel opposant toutes les filières de l\'EST. Phase de groupes + élimination directe. Coupe et médailles pour les finalistes.',
    image:       'event-1777864072903.png',
    price:       0,
    date:        new Date('2025-12-05T14:00:00'),
    location:    'Terrain de sport, Campus EST Dakhla',
    category:    'sport',
    capacity:    300
  },
  {
    title:       'Journée Scientifique & Innovation',
    description: 'Présentation des projets de recherche des étudiants, conférences de chercheurs invités et ateliers pratiques en sciences et technologies.',
    image:       'event-1777865361921.png',
    price:       50,
    date:        new Date('2025-12-12T08:30:00'),
    location:    'Laboratoires & Salle de conférence, EST Dakhla',
    category:    'science',
    capacity:    150
  },
  {
    title:       'Gala Musical de Fin d\'Année',
    description: 'Concert de fin d\'année mettant en scène les talents musicaux des étudiants. Jazz, musique andalouse et fusion moderne.',
    image:       'event-1777865515607.png',
    price:       80,
    date:        new Date('2025-12-20T19:00:00'),
    location:    'Grande salle des fêtes, Dakhla',
    category:    'music',
    capacity:    250
  },
  {
    title:       'Atelier Intelligence Artificielle',
    description: 'Introduction pratique au Machine Learning et à l\'IA générative. Exercices sur Python, TensorFlow et l\'API OpenAI. Niveau débutant-intermédiaire.',
    image:       'event-1777865613581.png',
    price:       0,
    date:        new Date('2026-01-10T10:00:00'),
    location:    'Salle informatique B, EST Dakhla',
    category:    'tech',
    capacity:    40
  },
  {
    title:       'Exposition Artisanat de Dakhla',
    description: 'Exposition vente des créations artisanales locales : poterie, bijoux, tapis et sculptures. Participation de 20 artisans de la région.',
    image:       'event-1777865338460.png',
    price:       20,
    date:        new Date('2026-01-25T09:00:00'),
    location:    'Hall principal, EST Dakhla',
    category:    'culture',
    capacity:    500
  },
  {
    title:       'Championnat de Basketball 3x3',
    description: 'Tournoi de basketball 3 contre 3 ouvert aux étudiants et aux clubs de la ville. Catégories masculin et féminin. Inscription gratuite.',
    image:       'event-1777865476584.png',
    price:       0,
    date:        new Date('2026-02-08T10:00:00'),
    location:    'Gymnase de l\'EST Dakhla',
    category:    'sport',
    capacity:    120
  }
];

// ── USERS ─────────────────────────────────────────────────────────────────────
// Les mots de passe seront hashés automatiquement par le pre-save hook du modèle User
const users = [
  {
    name:     'Admin EST',
    email:    'admin@est-dakhla.ac.ma',
    password: 'admin123',
    role:     'admin'
  },
  {
    name:     'Ahmed Benali',
    email:    'ahmed@est.ma',
    password: 'password123',
    role:     'student'
  },
  {
    name:     'Fatima Zahra',
    email:    'fatima@est.ma',
    password: 'password123',
    role:     'student'
  },
  {
    name:     'Youssef Alami',
    email:    'youssef@est.ma',
    password: 'password123',
    role:     'student'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB\n');

    // ── Events ────────────────────────────────────────
    await Event.deleteMany({});
    const insertedEvents = await Event.insertMany(events);
    console.log(`✓ ${insertedEvents.length} événements insérés :`);
    insertedEvents.forEach(e =>
      console.log(`  - [${e.category}] ${e.title} — ${e.price === 0 ? 'GRATUIT' : e.price + ' MAD'}`)
    );

    // ── Users ─────────────────────────────────────────
    await User.deleteMany({});
    const savedUsers = [];
    for (const u of users) {
      const user = new User(u);
      await user.save();
      savedUsers.push(user);
    }
    console.log(`\n✓ ${savedUsers.length} utilisateurs insérés :`);
    savedUsers.forEach(u =>
      console.log(`  - [${u.role}] ${u.name} — ${u.email}`)
    );

    // ── Réservations de test ──────────────────────────
    await Reservation.deleteMany({});
    const e0 = insertedEvents[0]; // Hackathon (gratuit)
    const e1 = insertedEvents[1]; // Soirée Culturelle (30 MAD)
    const e3 = insertedEvents[3]; // Journée Scientifique (50 MAD)

    const reservations = [
      {
        studentName:  'Ahmed Benali',
        studentEmail: 'ahmed@est.ma',
        events: [
          { eventId: e0._id, title: e0.title, price: e0.price },
          { eventId: e1._id, title: e1.title, price: e1.price }
        ],
        total:  e0.price + e1.price,
        status: 'confirmed'
      },
      {
        studentName:  'Fatima Zahra',
        studentEmail: 'fatima@est.ma',
        events: [
          { eventId: e3._id, title: e3.title, price: e3.price }
        ],
        total:  e3.price,
        status: 'pending'
      },
      {
        studentName:  'Youssef Alami',
        studentEmail: 'youssef@est.ma',
        events: [
          { eventId: e0._id, title: e0.title, price: e0.price }
        ],
        total:  e0.price,
        status: 'cancelled'
      }
    ];

    const insertedRes = await Reservation.insertMany(reservations);
    console.log(`\n✓ ${insertedRes.length} réservations insérées :`);
    insertedRes.forEach(r =>
      console.log(`  - [${r.status}] ${r.studentName} — ${r.total} MAD`)
    );

    console.log('\n─────────────────────────────────────────');
    console.log('Comptes de test :');
    console.log('  Admin    → admin@est-dakhla.ac.ma / admin123');
    console.log('  Étudiant → ahmed@est.ma           / password123');
    console.log('─────────────────────────────────────────');

  } catch (err) {
    console.error('Erreur seed :', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDéconnecté de MongoDB');
  }
}

seed();
