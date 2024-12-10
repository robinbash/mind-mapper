import { addMessages } from '$lib/server/domain';
import { PostSimple } from '$lib/server/common-requests';

export const POST = PostSimple(addMessages);
