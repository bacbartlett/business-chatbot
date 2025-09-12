import { auth, currentUser } from '@clerk/nextjs/server';
import { getSuggestionsByDocumentId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter documentId is required.',
    ).toResponse();
  }

  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return new ChatSDKError('unauthorized:suggestions').toResponse();
  }
  const user = await currentUser();
  const email = user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user?.emailAddresses?.[0]?.emailAddress
    ?? null;
  const name = user ? ([user.firstName, user.lastName].filter(Boolean).join(' ') || (user as any).fullName || user.username || null) : null;
  const { ensureUserExists } = await import('@/lib/db/queries');
  await ensureUserExists({ id: userId, email, name });

  const suggestions = await getSuggestionsByDocumentId({
    documentId,
  });

  const [suggestion] = suggestions;

  if (!suggestion) {
    return Response.json([], { status: 200 });
  }

  if (suggestion.userId !== userId) {
    return new ChatSDKError('forbidden:api').toResponse();
  }

  return Response.json(suggestions, { status: 200 });
}
