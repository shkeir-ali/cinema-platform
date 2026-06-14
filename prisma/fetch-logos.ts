import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const API_KEY = process.env.TMDB_API_KEY
if (!API_KEY) { console.error('Missing TMDB_API_KEY in .env.local'); process.exit(1) }

type TmdbLogo = {
  file_path: string
  iso_639_1: string | null
  vote_average: number
}

async function fetchBestLogo(tmdbId: number): Promise<string | null> {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}/images?include_image_language=en,null&api_key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) { process.stdout.write(`HTTP ${res.status} `); return null }
  const data = await res.json() as { logos: TmdbLogo[] }
  const logos = data.logos ?? []
  if (!logos.length) return null
  // Prefer English logos; sort by vote_average descending
  const english = logos.filter(l => l.iso_639_1 === 'en')
  const pool = english.length > 0 ? english : logos
  pool.sort((a, b) => b.vote_average - a.vote_average)
  return pool[0].file_path
}

async function main() {
  const reviews = await prisma.review.findMany({
    select: { id: true, title: true, tmdbId: true },
    orderBy: { createdAt: 'asc' },
  })

  for (const review of reviews) {
    process.stdout.write(`  ${review.title}... `)
    const logoPath = await fetchBestLogo(review.tmdbId)
    if (logoPath) {
      await prisma.review.update({ where: { id: review.id }, data: { logoPath } })
      console.log(`✓  ${logoPath}`)
    } else {
      console.log('✗  no logo found')
    }
    await new Promise(r => setTimeout(r, 250))
  }

  console.log('\n✓ Done')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
