
// pages/api/products.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone'
import { getEmbeddings } from '@/utils/embeddings';
import db from '@/utils/db';


type Metadata = {
  id: string
  description: string
}

const pinecone = new Pinecone()
const limit = 10


async function handler(req: NextRequest) {
  const { searchTerm, currentPage } = await req.json();
  console.log(searchTerm, currentPage)
  const offset = currentPage > 1 ? (currentPage - 1) * limit : currentPage

  const pgClient = await db.getClient()

  const index = await pinecone.index<Metadata>(process.env.PINECONE_INDEX!)


  const embeddedSearchTerm = await getEmbeddings(searchTerm)

  const result = await index.query({
    vector: embeddedSearchTerm,
    topK: 100,
    includeMetadata: true
  })

  console.log(result)

  const ids = result.matches?.map((match) => match.metadata?.id)

  const query = `
    SELECT * FROM products 
    ${ids.length > 0 ? `WHERE id IN (${ids?.map((id) => `'${id}'`).join(',')})` : ''}
    LIMIT ${limit} OFFSET ${offset}    
  `

  console.log(`query: ${query}`)

  const products = await pgClient.query(query)

  console.log(products.rows)

  return NextResponse.json(products.rows)

}


export {
  handler as POST
}
