import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireOwner, unauthorized } from "@/lib/auth";
import { getStorageBucket, getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
]);

export async function POST(req: NextRequest) {
  const session = await requireOwner(req);
  if (!session) return unauthorized();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be under 12MB" },
      { status: 400 }
    );
  }

  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json(
      {
        error:
          "Only JPEG, PNG, WebP, GIF images or MP4/WebM videos are allowed",
      },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const head = buf.subarray(0, 32).toString("utf8").toLowerCase();
  if (head.includes("<!doctype") || head.includes("<html")) {
    return NextResponse.json({ error: "Invalid file content" }, { status: 400 });
  }

  const filename = `products/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const bucket = getStorageBucket();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(bucket).upload(filename, buf, {
    contentType: file.type,
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) {
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  const publicUrl = data.publicUrl;

  return NextResponse.json({
    ok: true,
    url: publicUrl,
    success: true,
    type: file.type.startsWith("video/") ? "video" : "image",
    size: file.size,
  });
}
