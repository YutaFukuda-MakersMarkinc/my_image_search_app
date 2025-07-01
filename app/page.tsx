"use client";

import { useState } from "react";

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<
    { previewUrl: string; description: string; results: any[] }[]
  >([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDescription(null);
    setResults([]);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!imageFile) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64DataUrl = reader.result?.toString();
      if (!base64DataUrl) return;

      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageDataUrl: base64DataUrl }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "GPT APIエラー");

        setDescription(data.description);
        const imageResults = await fetchUnsplashImages(data.description);

        setHistory((prev) => [
          ...prev,
          {
            previewUrl: previewUrl ?? "",
            description: data.description,
            results: imageResults,
          },
        ]);
      } catch (err) {
        console.error("GPTエラー:", err);
        setError("❌ GPT APIによる説明取得に失敗しました。");
        setDescription(null);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(imageFile);
  };

  const fetchUnsplashImages = async (query: string) => {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&per_page=30&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0] || "Unsplash APIエラー");
      setResults(data.results);
      return data.results;
    } catch (err) {
      console.error("Unsplash APIエラー:", err);
      setError("❌ Unsplash APIから画像を取得できませんでした。");
      setResults([]);
      return [];
    }
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center my-6">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-gray-100 py-12 px-6">
      <div className="max-w-xl mx-auto bg-white shadow-2xl rounded-2xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">画像から類似画像を検索</h1>

        <label className="block mb-4">
          <span className="text-gray-700 font-medium">画像を選択:</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        {previewUrl && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">プレビュー:</p>
            <img
              src={previewUrl}
              alt="preview"
              className="rounded-xl shadow-lg border border-gray-200"
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!imageFile || loading}
          className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "処理中..." : "GPT + Unsplash検索"}
        </button>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">⚠ エラー:</strong>
            <span className="block mt-1">{error}</span>
          </div>
        )}

        {description && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4 border border-gray-300 text-gray-700 whitespace-pre-line">
            <strong>📄 GPTの説明:</strong>
            <p className="mt-2">{description}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">🔍 類似画像:</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {results.map((img, idx) => (
                <a
                  key={idx}
                  href={img.links.html}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={img.urls.thumb}
                    alt={img.alt_description || "unsplash image"}
                    className="rounded-md shadow-sm hover:shadow-md transition"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">🕘 検索履歴</h2>
            {history.map((item, idx) => (
              <div key={idx} className="mb-8 border-t pt-4">
                <div className="mb-2 text-sm text-gray-600">#{idx + 1}</div>
                <img src={item.previewUrl} alt="履歴画像" className="w-32 rounded shadow mb-2" />
                <p className="mb-2 text-gray-700 whitespace-pre-line">
                  <strong>説明:</strong> {item.description}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {item.results.map((img, j) => (
                    <a
                      key={j}
                      href={img.links.html}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={img.urls.thumb}
                        alt={img.alt_description || "unsplash"}
                        className="rounded-md shadow-sm hover:shadow-md transition"
                      />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
