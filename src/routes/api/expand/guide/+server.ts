import { PostStream } from '$lib/server/common-requests';
import { getExpansionGuidance } from '$lib/server/domain';

export const POST = PostStream(getExpansionGuidance);
