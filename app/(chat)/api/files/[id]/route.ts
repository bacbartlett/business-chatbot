import { NextResponse } from 'next/server';
import { getFileUploadPublicById } from '@/lib/db/queries';

export async function GET(
	_request: Request,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;
		const file = await getFileUploadPublicById({ id });

		if (!file) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 });
		}

		if (!file.data) {
			return NextResponse.json({ error: 'File data missing' }, { status: 404 });
		}

		const headers = new Headers();
		headers.set('Content-Type', file.contentType ?? 'application/octet-stream');
		if (file.size != null) headers.set('Content-Length', String(file.size));
		headers.set('Content-Disposition', `inline; filename="${file.filename}"`);

		return new Response(file.data as unknown as Uint8Array, {
			headers,
		});
	} catch (error) {
		console.error('[files.get] Failed to serve file', error);
		return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
	}
}

