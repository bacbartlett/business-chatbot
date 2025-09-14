import { auth, currentUser } from '@clerk/nextjs/server';
import { ChatSDKError } from '@/lib/errors';
import {
	ensureUserExists,
	getFourRandomSuggestedPromptsByUserId,
	seedSuggestedPromptsForUser,
} from '@/lib/db/queries';

export async function GET() {
	const session = await auth();
	const userId = session.userId;

	if (!userId) {
		return new ChatSDKError('unauthorized:auth').toResponse();
	}

	const user = await currentUser();
	const email =
		user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
			?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;
	const name = user
		? ([user.firstName, user.lastName].filter(Boolean).join(' ') ||
		   (user as any).fullName ||
		   user.username ||
		   null)
		: null;

	await ensureUserExists({ id: userId, email, name });
	await seedSuggestedPromptsForUser({ userId });

	const prompts = await getFourRandomSuggestedPromptsByUserId({ userId });
	return Response.json(
		prompts.map((p) => ({ id: p.id, text: p.text })),
		{ status: 200 },
	);
}


