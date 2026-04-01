import { NextResponse } from "next/server";
import { getLinksCollection } from "@/lib/links";
import { generateShortCode, normalizeUrl } from "@/lib/shortcode";

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { url?: string }
    | null;

  const normalized = normalizeUrl(body?.url ?? "");
  if (!normalized) {
    return NextResponse.json(
      { error: "URL tidak valid. Coba masukkan URL yang benar." },
      { status: 400 }
    );
  }

  const collection = await getLinksCollection();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const code = generateShortCode(7);
    try {
      await collection.insertOne({
        code,
        targetUrl: normalized,
        createdAt: new Date(),
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ?? new URL(request.url).origin;

      return NextResponse.json({
        code,
        targetUrl: normalized,
        shortUrl: `${baseUrl}/${code}`,
      });
    } catch (error) {
      const duplicate = (error as { code?: number }).code === 11000;
      if (!duplicate) {
        break;
      }
    }
  }

  return NextResponse.json(
    { error: "Gagal membuat kode unik. Coba lagi." },
    { status: 500 }
  );
}
