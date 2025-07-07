(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "https://my-image-search-app.vercel.app/widget";
  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "400px",
    height: "600px",
    border: "none",
    zIndex: "9999",
    borderRadius: "16px",
    backgroundColor: "transparent" // ✅ ここはそのままでOK
  });

  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("title", "AI画像検索ウィジェット");

  document.body.appendChild(iframe);
})();
