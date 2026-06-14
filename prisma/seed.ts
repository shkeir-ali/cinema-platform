import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clear existing data so re-seeding always reflects the latest values
  await prisma.post.deleteMany()
  await prisma.review.deleteMany()

  // ── Reviews ────────────────────────────────────────────────────────────────
  const reviews = [
    {
      tmdbId: 49026,
      title: 'La La Land',
      // Per-film title art direction (extracted from the design prototype):
      // "La La" in twilight purple, "Land" in gold — matching the film's poster.
      titleDisplay: [
        { text: 'La La ', style: { color: '#8f5fd4', textShadow: '0 2px 12px rgba(0,0,0,0.15)' } },
        { text: 'Land', style: { color: '#d4a82a', textShadow: '0 2px 12px rgba(0,0,0,0.15)' } },
      ],
      slug: 'la-la-land',
      director: 'Damien Chazelle',
      cast: 'Ryan Gosling, Emma Stone, John Legend',
      posterPath: '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
      backdropPath: '/tkBx8aYZ0DVRWSXeEzyVDP6oUBA.jpg',
      releaseYear: 2016,
      genres: ['Romance', 'Musical'],
      tags: ['melancholy', 'ambition', 'jazz', 'los angeles'],
      excerpt: 'Chazelle makes melancholy feel like magic — a love letter to ambition and the people we leave behind in its pursuit.',
      myRating: 5,
      myReview: `La La Land arrived at a moment when cinema needed to believe in itself again. Damien Chazelle's third feature is an act of audacious sincerity — a film that asks whether art and love can coexist, and answers with a bittersweet shrug that somehow feels like the most honest thing in the world.\n\nRyan Gosling and Emma Stone are incandescent together, their chemistry so natural it borders on unfair. But the film's real star is Chazelle's direction: the opening freeway sequence announces immediately that you are watching something that operates by its own rules.\n\nIt is a film about the price of dreams. And it costs you something to watch it.`,
      isFeatured: true,
      published: true,
    },
    {
      tmdbId: 335984,
      title: 'Blade Runner 2049',
      slug: 'blade-runner-2049',
      director: 'Denis Villeneuve',
      cast: 'Ryan Gosling, Harrison Ford, Ana de Armas',
      posterPath: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
      backdropPath: '/sOUAHOiVFmBqKYgJBHEGJHWxASq.jpg',
      releaseYear: 2017,
      genres: ['Sci-Fi'],
      tags: ['dystopia', 'identity', 'memory', 'villeneuve'],
      excerpt: 'A sequel that surpasses its predecessor in every dimension — visually, philosophically, emotionally.',
      myRating: 4.5,
      myReview: 'Villeneuve does the impossible: he makes a sequel to Blade Runner that feels necessary.',
      isFeatured: false,
      published: true,
    },
    {
      tmdbId: 238,
      title: 'The Godfather',
      slug: 'the-godfather',
      director: 'Francis Ford Coppola',
      cast: 'Marlon Brando, Al Pacino, James Caan',
      posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      backdropPath: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
      releaseYear: 1972,
      genres: ['Drama', 'Crime'],
      tags: ['mafia', 'family', 'power', 'classic'],
      excerpt: 'The definitive American crime epic. Everything that came after is in conversation with this film.',
      myRating: 4,
      myReview: 'There is nothing left to say about The Godfather that has not already been said. So I will only say this: it earns every superlative.',
      isFeatured: false,
      published: true,
    },
    {
      tmdbId: 496243,
      title: 'Parasite',
      slug: 'parasite',
      director: 'Bong Joon-ho',
      cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong',
      posterPath: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      backdropPath: '/ApiBzeaa95TNYLiVqpJcqKr3RnJ.jpg',
      releaseYear: 2019,
      genres: ['Thriller', 'Drama'],
      tags: ['class', 'satire', 'south korea', 'bong joon-ho'],
      excerpt: 'A masterclass in tonal control — comedy, thriller, and tragedy braided into one impossible film.',
      myRating: 3.5,
      myReview: 'Bong Joon-ho spent his career preparing to make this film. It shows.',
      isFeatured: false,
      published: true,
    },
    {
      tmdbId: 843,
      title: 'In the Mood for Love',
      slug: 'in-the-mood-for-love',
      director: 'Wong Kar-wai',
      cast: 'Tony Leung, Maggie Cheung',
      posterPath: '/iYypPT4bhqXfq1b6EnmxvRt6b2Y.jpg',
      backdropPath: '/6LEsXkKvRrEAFEaJMWK1n3LHZIO.jpg',
      releaseYear: 2000,
      genres: ['Romance', 'Drama'],
      tags: ['longing', 'hong kong', 'restraint', 'wong kar-wai'],
      excerpt: 'Cinema has rarely captured longing this precisely. Every frame is a held breath.',
      myRating: 4.5,
      myReview: 'Wong Kar-wai films desire like no one else. In the Mood for Love is his purest expression of it.',
      isFeatured: false,
      published: true,
    },
    {
      tmdbId: 493922,
      title: 'Hereditary',
      slug: 'hereditary',
      director: 'Ari Aster',
      cast: 'Toni Collette, Alex Wolff, Milly Shapiro',
      posterPath: '/4GFPuL14eXi66V96xBWY73Y9PfR.jpg',
      backdropPath: '/fDSVgPUTNzHiLzUHZgSaEgJKYGU.jpg',
      releaseYear: 2018,
      genres: ['Horror'],
      tags: ['grief', 'family', 'dread', 'ari aster'],
      excerpt: 'The most unsettling film about grief ever made, disguised as a horror movie.',
      myRating: 3,
      myReview: 'Ari Aster announced himself with a film that refuses to let you go.',
      isFeatured: false,
      published: true,
    },
    {
      tmdbId: 1020,
      title: 'Mulholland Drive',
      slug: 'mulholland-drive',
      director: 'David Lynch',
      cast: 'Naomi Watts, Laura Harring, Justin Theroux',
      posterPath: '/x7A59t6ySylr1L7aubOQEA480vM.jpg',
      backdropPath: '/v96FoHFqBNLkuUCy7ZKxUPLfSIK.jpg',
      releaseYear: 2001,
      genres: ['Thriller', 'Mystery'],
      tags: ['dream', 'hollywood', 'identity', 'lynch'],
      excerpt: 'Lynch at his most labyrinthine. A puzzle that rewards surrender more than solution.',
      myRating: 3.5,
      myReview: 'You do not solve Mulholland Drive. You experience it, and it changes you.',
      isFeatured: false,
      published: true,
    },
    {
      tmdbId: 62,
      title: '2001: A Space Odyssey',
      slug: '2001-a-space-odyssey',
      director: 'Stanley Kubrick',
      cast: 'Keir Dullea, Gary Lockwood, Douglas Rain',
      posterPath: '/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg',
      backdropPath: '/yOb9v8rFWTuHdFNhKfRkNOzHfRb.jpg',
      releaseYear: 1968,
      genres: ['Sci-Fi'],
      tags: ['kubrick', 'space', 'evolution', 'hal 9000'],
      excerpt: 'The ceiling of cinematic ambition. Kubrick made a film the medium is still catching up to.',
      myRating: 5,
      myReview: 'To watch 2001 is to be reminded that cinema can reach for something beyond entertainment.',
      isFeatured: false,
      published: true,
    },
  ]

  for (const review of reviews) {
    await prisma.review.create({ data: review })
  }

  // Fix float ratings — Prisma 7 pg adapter truncates decimals in create()
  await prisma.$executeRaw`UPDATE "Review" SET "myRating" = 4.5 WHERE slug = 'blade-runner-2049'`
  await prisma.$executeRaw`UPDATE "Review" SET "myRating" = 3.5 WHERE slug = 'parasite'`
  await prisma.$executeRaw`UPDATE "Review" SET "myRating" = 4.5 WHERE slug = 'in-the-mood-for-love'`
  await prisma.$executeRaw`UPDATE "Review" SET "myRating" = 3.5 WHERE slug = 'mulholland-drive'`

  // ── Posts (Essays) ─────────────────────────────────────────────────────────
  await prisma.post.createMany({
    data: [
      {
        title: "Why Kubrick's obsession with symmetry still matters",
        slug: 'kubrick-symmetry',
        excerpt: "Every frame a painting — but what does it mean when the geometry becomes the message? A deep dive into how Kubrick turned the camera into a philosophical instrument.",
        content: `Stanley Kubrick did not compose shots. He constructed arguments.\n\nFrom the perfectly centred corridors of The Shining to the one-point perspective hallways of Full Metal Jacket, Kubrick's symmetry was never merely aesthetic — it was rhetorical. The geometry was the point.\n\nWhen a human being is placed at the exact centre of a symmetrical frame, something uncomfortable happens. The world becomes too ordered. Too controlled. The character looks trapped, even when they are standing still — pinned by the architecture of the image itself.\n\nThis is Kubrick's great trick: he used beauty to create unease. The more perfectly composed the frame, the more you sense that something is wrong.\n\nIn 2001, the symmetry is cosmic — HAL's red eye centred perfectly, the spacecraft moving through void with mathematical precision. In Eyes Wide Shut, it is domestic and sinister, the symmetry of bourgeois life exposed as a kind of prison.\n\nDecades after his death, filmmakers are still quoting Kubrick's frames. What they often miss is that the symmetry was never decorative. It was always a trap.`,
        category: 'Film Theory',
        isFeatured: true,
        published: true,
        publishedAt: new Date('2026-06-01'),
      },
      {
        title: 'The French New Wave and its lasting shadow on modern cinema',
        slug: 'french-new-wave',
        excerpt: "Godard, Truffaut, Varda — sixty years later their fingerprints are on everything from Tarantino to Céline Song. How a movement born of rebellion became the establishment.",
        content: `In 1959, a group of young French critics-turned-filmmakers decided that cinema had grown too comfortable.\n\nGodard jump-cut his way through À bout de souffle. Truffaut put a child's face at the centre of The 400 Blows and let the audience sit with his silence. Varda pointed her camera at a woman walking through a market and made it feel like a philosophical act.\n\nThey were making it up as they went. That was the point.\n\nThe Nouvelle Vague was not a manifesto — it was an attitude. Cinema could be personal. The camera could be a pen. The director was an author, not a craftsman.\n\nSixty years later, their fingerprints are everywhere. When Tarantino has characters talk about nothing for ten minutes, that is the New Wave. When Céline Song lets In the Mood for Love silence speak louder than dialogue, that is the New Wave. When any filmmaker breaks the fourth wall and dares the audience to stay with them, that is the New Wave.\n\nThe rebellion became the establishment. And the establishment became the language.`,
        category: 'History',
        isFeatured: false,
        published: true,
        publishedAt: new Date('2026-05-10'),
      },
      {
        title: "Villeneuve's silence: how Denis speaks without words",
        slug: 'villeneuve-silence',
        excerpt: "From Incendies to Dune, Denis Villeneuve has made restraint his signature. An exploration of how silence, scale, and stillness carry more weight than any dialogue could.",
        content: `Denis Villeneuve does not trust dialogue.\n\nThis is not a criticism. It is the key to understanding why his films feel the way they do — vast, deliberate, heavy with implication.\n\nIn Arrival, the most important moment is a woman standing in a field, watching something descend from the sky. No words. Just presence, scale, and Johann Johannsson's score pressing against the silence.\n\nIn Blade Runner 2049, Ryan Gosling walks through an orange wasteland for minutes at a time. The emptiness is the point. The silence is the argument.\n\nVilleneuve learned this from the films he grew up on — Kubrick, Tarkovsky, Leone. Directors who understood that what you withhold is as powerful as what you show. That the audience's imagination, properly guided, will do more work than any line of dialogue.\n\nDune is perhaps his purest expression of this. A film of enormous scale that is, at its core, about a young man who does not want what everyone expects of him. Villeneuve never says this directly. He lets you feel it in the silences between scenes, the stillness in Chalamet's face, the weight of the sky above Arrakis.\n\nSilence, in Villeneuve's hands, is never empty. It is always full of something you cannot quite name.`,
        category: 'Director Study',
        isFeatured: false,
        published: true,
        publishedAt: new Date('2026-04-18'),
      },
    ],
  })

  console.log('✓ Seed complete')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
