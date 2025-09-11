// import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import { saveFileUpload } from '@/lib/db/queries';

// Use Blob instead of File since File is not available in Node.js environment
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // legacy .doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // legacy .xls
]);

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size should be less than 10MB',
    })
    .refine((file) => ALLOWED_TYPES.has(file.type), {
      message: 'Unsupported file type',
    }),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const fileAsFile = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = fileAsFile.name;
    const fileBuffer = await file.arrayBuffer();

    const id = nanoid();
    const contentType = fileAsFile.type || 'application/octet-stream';
    const size = file.size;
    const origin = new URL(request.url).origin;

    try {
      await saveFileUpload({
        id,
        userId,
        filename,
        pathname: filename,
        url: `${origin}/api/files/${id}`,
        contentType,
        size,
        data: new Uint8Array(fileBuffer as ArrayBuffer),
      });
    } catch (e) {
      console.error('[upload] Failed to persist metadata', e);
      return NextResponse.json({ error: 'Failed to persist metadata' }, { status: 500 });
    }

    return NextResponse.json({
      id,
      pathname: filename,
      url: `${origin}/api/files/${id}`,
      contentType,
      size,
      dbSaved: true,
    });
  } catch (error) {
    console.error('[upload] Failed to process request', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json({ error: message ?? 'Failed to process request' }, { status: 500 });
  }
}
