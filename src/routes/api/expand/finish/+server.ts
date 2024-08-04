import { PostSimple } from '$lib/server/common-requests';
import { finishExpanding } from '$lib/server/domain';

export const POST = PostSimple(finishExpanding);
