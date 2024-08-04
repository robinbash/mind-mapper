import { PostStream } from '$lib/server/common-requests';
import { getRefinementGuidance } from '$lib/server/domain';

export const POST = PostStream(getRefinementGuidance);
