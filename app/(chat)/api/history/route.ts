import { auth, currentUser } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { getChatsByUserId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = Number.parseInt(searchParams.get('limit') || '10');
  const startingAfter = searchParams.get('starting_after');
  const endingBefore = searchParams.get('ending_before');

  if (startingAfter && endingBefore) {
    return new ChatSDKError(
      'bad_request:api',
      'Only one of starting_after or ending_before can be provided.',
    ).toResponse();
  }

  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }
  const user = await currentUser();
  const email = user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user?.emailAddresses?.[0]?.emailAddress
    ?? null;
  const name = user ? ([user.firstName, user.lastName].filter(Boolean).join(' ') || (user as any).fullName || user.username || null) : null;
  const { ensureUserExists } = await import('@/lib/db/queries');
  await ensureUserExists({ id: userId, email, name });

  const chats = await getChatsByUserId({
    id: userId,
    limit,
    startingAfter,
    endingBefore,
  });

  return Response.json(chats);
}
