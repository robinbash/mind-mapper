import { PostSimple } from '$lib/server/common-requests';
import { splitTopic } from '$lib/server/domain';

export const POST = PostSimple(splitTopic);
