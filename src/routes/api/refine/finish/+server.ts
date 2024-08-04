import { PostSimple } from '$lib/server/common-requests';
import { finishRefining } from '$lib/server/domain';

export const POST = PostSimple(finishRefining);
