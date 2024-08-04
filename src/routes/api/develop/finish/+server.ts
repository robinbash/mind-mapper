import { PostSimple } from '$lib/server/common-requests';
import { finishDeveloping } from '$lib/server/domain';

export const POST = PostSimple(finishDeveloping);
