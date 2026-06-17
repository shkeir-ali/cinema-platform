import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  const reviews = await db.review.findMany({
    select: { id: true, tmdbId: true, title: true },
  })

  console.log(`Backfilling ${reviews.length} reviews…`)

  for (const review of reviews) {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${review.tmdbId}?api_key=${process.env.TMDB_API_KEY}`
    )
    if (!res.ok) {
      console.log(`  ✗ ${review.title} — TMDB error ${res.status}`)
      continue
    }
    const data = await res.json()
    const collectionId: number | null = data.belongs_to_collection?.id ?? null
    await db.review.update({
      where: { id: review.id },
      data: { tmdbCollectionId: collectionId },
    })
    console.log(
      collectionId
        ? `  ✓ ${review.title} → collection ${collectionId} (${data.belongs_to_collection.name})`
        : `  — ${review.title} → no collection`
    )
    // Respect TMDB rate limit (40 req/10s)
    await new Promise(r => setTimeout(r, 260))
  }

  console.log('Done.')
}

main().finally(() => db.$disconnect())
