import { NextResponse } from "next/server";
import { getLinksCollection } from "@/lib/links";

const notFoundHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Link not found</title>
    <style>
      body { margin:0; font-family: Arial, sans-serif; background:#0b0b0d; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; }
      .card { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:32px; border-radius:16px; text-align:center; }
      .title { font-size:24px; margin-bottom:8px; }
      .muted { color: rgba(255,255,255,0.6); font-size:14px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">404 - Link tidak ditemukan</div>
      <div class="muted">Periksa kembali kode short URL yang kamu buka.</div>
    </div>
  </body>
</html>`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const collection = await getLinksCollection();
  const doc = await collection.findOne({ code });

  if (!doc) {
    return new Response(notFoundHtml, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.redirect(doc.targetUrl, 302);
}
