import { PostStream } from '$lib/server/common-requests';
import { getDevelopmentGuidance } from '$lib/server/domain';

export const POST = PostStream(getDevelopmentGuidance);
