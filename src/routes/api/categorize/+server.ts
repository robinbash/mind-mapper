import { PostSimple } from '$lib/server/common-requests';
import { categorize } from '$lib/server/domain';

export const POST = PostSimple(categorize);
