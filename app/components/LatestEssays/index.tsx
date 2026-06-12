import { db } from '@/lib/db'
import LatestEssaysFlipbook from './LatestEssaysFlipbook'

export default async function LatestEssays() {
  const posts = await db.post.findMany({
    where: { published: true, isFeatured: false },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      publishedAt: true,
    },
  })

  return <LatestEssaysFlipbook posts={posts} />
}
