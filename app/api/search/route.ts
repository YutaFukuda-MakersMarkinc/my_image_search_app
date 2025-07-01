// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";

const CHAT_GPT_API_KEY = process.env.CHAT_GPT_API_KEY!;

export async function POST(req: NextRequest) {
  const { imageDataUrl } = await req.json();

  if (!imageDataUrl) {
    return NextResponse.json({ error: "画像がありません" }, { status: 400 });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CHAT_GPT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o", // Vision対応モデル
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl, // data:image/jpeg;base64,〜 の形式
              },
            },
            {
              type: "text",
              text: "この画像の内容を簡単に日本語で説明してください。",
            },
          ],
        },
      ],
      max_tokens: 100,
    }),
  });

  const data = await response.json();

  const description =
    data.choices?.[0]?.message?.content || "説明が取得できませんでした";

  return NextResponse.json({ description });
}
