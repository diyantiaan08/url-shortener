import clientPromise from "./mongodb";

export type LinkDoc = {
  code: string;
  targetUrl: string;
  createdAt: Date;
};

let indexPromise: Promise<string> | null = null;

export async function getLinksCollection() {
  const client = await clientPromise;
  const db = client.db("db-url-shorter");
  const collection = db.collection<LinkDoc>("links");

  if (!indexPromise) {
    indexPromise = collection.createIndex({ code: 1 }, { unique: true });
  }
  await indexPromise;

  return collection;
}
