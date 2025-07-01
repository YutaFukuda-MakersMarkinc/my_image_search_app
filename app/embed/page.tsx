export default function EmbedPage() {
  return (
    <html>
      <body style={{ margin: 0 }}>
        <div style={{ width: "100%", height: "100vh" }}>
          {/* 👇 ウィジェットUIを直接表示 */}
          <iframe
            src="/"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </div>
      </body>
    </html>
  );
}
