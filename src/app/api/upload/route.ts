import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5 MB (Vercel serverless limit)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 4.5 MB" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    const path = `attachments/${timestamp}-${sanitizedName}`;

    const blob = await put(path, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
