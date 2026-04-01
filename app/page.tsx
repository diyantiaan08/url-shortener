"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";

type ShortenResponse = {
  shortUrl: string;
  code: string;
  targetUrl: string;
};

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://ngtc-si.com";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [error, setError] = useState("");
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("ngtc-theme");
    const preferred =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
    setTheme(preferred);
    document.documentElement.dataset.theme = preferred;
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("ngtc-theme", next);
  };

  const submit = async () => {
    if (!url.trim()) {
      setError("Masukkan URL yang ingin dipendekkan.");
      return;
    }

    setError("");
    setResult(null);
    setCopied(false);

    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(payload?.error ?? "Gagal memproses URL. Coba lagi.");
      return;
    }

    const data = (await response.json()) as ShortenResponse;
    setResult({
      ...data,
      shortUrl: data.shortUrl.replace(DEFAULT_BASE_URL, baseUrl),
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      void submit();
    });
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
  };

  const resetForm = () => {
    setUrl("");
    setResult(null);
    setError("");
    setCopied(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-orbit">
      <header className="mx-auto flex w-full items-center justify-between px-4 pt-8 md:px-2">
        <div className="logo-glow flex items-center gap-4">
          <Image
            src="/nagatech-logo.png"
            alt="Nagatech Sistem Integrator"
            width={120}
            height={48}
            className="relative z-10 brightness-150 drop-shadow-[0_0_22px_rgba(255,169,64,0.55)]"
            priority
          />
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--stroke)] text-foreground transition hover:border-[color:var(--accent)] md:mr-2"
        >
          {theme === "light" ? (
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          )}
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-16 pt-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <h1 className="font-[var(--font-display)] text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Shorten link, share cepat, tetap rapi.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted md:text-lg">
              URL Shortener resmi Nagatech untuk tim dan klien. Buat link pendek
              dengan branding ngtc-si.com dan kirim dengan percaya diri.
            </p>

            {!result ? (
              <form
                onSubmit={handleSubmit}
                className="glass flex flex-col gap-4 rounded-2xl p-5 md:flex-row md:items-end"
              >
                <div className="flex-1">
                  <label
                    htmlFor="url"
                    className="text-xs uppercase tracking-[0.2em] text-muted"
                  >
                    URL target
                  </label>
                  <input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="contoh: https://contoh.com/produk"
                    className="input-surface input-placeholder mt-2 w-full rounded-xl border border-[color:var(--stroke)] px-4 py-3 text-sm text-foreground focus:border-orange-300/60 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-[46px] rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? "Memproses..." : "Shorten"}
                </button>
              </form>
            ) : null}

            {error ? (
              <div className="error-card rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            ) : null}

            {result ? (
              <div className="glass flex flex-col gap-3 rounded-2xl p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Short URL
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {result.shortUrl}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-5 py-2 text-xs uppercase tracking-[0.2em] text-black transition hover:bg-[color:var(--accent-strong)]"
                  >
                    {copied ? "Tersalin" : "Copy"}
                  </button>
                </div>
                <p className="text-sm text-muted">
                  Mengarah ke: {result.targetUrl}
                </p>
                <div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-[color:var(--accent)] bg-[#f7b352] px-5 py-2 text-xs uppercase tracking-[0.2em] text-black transition hover:bg-[color:var(--accent)]"
                  >
                    Perpendek URL lain
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="glass flex flex-col justify-between rounded-3xl p-6">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Kenapa Nagatech
              </p>
              <div className="space-y-4">
                <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Aman & terkontrol
                  </p>
                  <p className="text-sm text-muted">
                    Link pendek dikelola di server Nagatech dengan MongoDB
                    internal.
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Branding profesional
                  </p>
                  <p className="text-sm text-muted">
                    Menggunakan domain ngtc-si.com agar terlihat resmi dan rapi.
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Cepat digunakan
                  </p>
                  <p className="text-sm text-muted">
                    Cukup tempel URL, tekan shorten, dan bagikan hasilnya.
                  </p>
                </div>
              </div>
            </div>

            <div className="pill mt-10 rounded-2xl p-4 text-xs uppercase tracking-[0.2em]">
              Powered by Nagatech Sistem Integrator
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
