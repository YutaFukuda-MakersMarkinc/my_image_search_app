"use client";

import { useState } from "react";

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text?: string; imageUrl?: string; results?: any[] }[]
  >([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // ユーザーからのメッセージとして追加（プレビュー画像）
    setMessages((prev) => [
      ...prev,
      { role: "user", text: "この画像を調べて", imageUrl: url },
    ]);
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

        setMessages((prev) => [
          ...prev,
          { role: "bot", text: data.description },
        ]);

        const imageResults = await fetchUnsplashImages(data.description);

        setMessages((prev) => [
          ...prev,
          { role: "bot", results: imageResults },
        ]);
      } catch (err) {
        console.error("エラー:", err);
        setError("❌ 処理中にエラーが発生しました。もう一度お試しください。");
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
        )}&per_page=6&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0] || "Unsplash APIエラー");
      return data.results;
    } catch (err) {
      console.error("Unsplash APIエラー:", err);
      setError("❌ Unsplash APIから画像を取得できませんでした。\n");
      return [];
    }
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center my-4">
      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white text-xl flex items-center justify-center rounded-full shadow-lg z-50 hover:bg-blue-700 transition"      >
        {isOpen ? "×" : "💬"}
      </button>

      {/* チャットウィジェット */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-[350px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 overflow-auto flex flex-col">
          <div className="p-4 flex-1 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  } p-3 rounded-xl shadow max-w-[80%]`}
                >
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="preview"
                      className="w-full mb-2 rounded"
                    />
                  )}
                  {msg.text && <p className="text-sm whitespace-pre-line">{msg.text}</p>}
                  {msg.results && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {msg.results.map((img, j) => (
                        <a
                          key={j}
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
                  )}
                </div>
              </div>
            ))}

            {loading && <LoadingSpinner />}
            {error && (
              <div className="text-red-600 text-sm mt-2">{error}</div>
            )}
          </div>

          <div className="p-4 border-t">
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-2 w-full text-sm"
              />
            </label>
            <button
              onClick={handleSubmit}
              disabled={!imageFile || loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              画像を送信
            </button>
          </div>
        </div>
      )}
    </>
  );
}
