(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "https://my-image-search-app.vercel.app/widget";

  // ✅ スタイル設定（順番や互換性を意識）
  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "400px",
    height: "600px",
    border: "none",
    zIndex: "9999",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    backgroundColor: "transparent" // ✅ background: transparent ではなく backgroundColor に変更
  });

  iframe.setAttribute("allowtransparency", "true"); // ✅ 互換性のためのHTML属性
  iframe.setAttribute("title", "AI画像検索ウィジェット"); // ✅ アクセシビリティ対応（任意）

  document.body.appendChild(iframe);
})();
