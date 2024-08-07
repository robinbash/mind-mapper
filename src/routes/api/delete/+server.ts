import { PostSimple } from '$lib/server/common-requests';
import { deleteTopic } from '$lib/server/domain';

export const POST = PostSimple(deleteTopic);
