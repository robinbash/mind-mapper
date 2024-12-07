import { submitPromptForNewTopic } from '$lib/server/domain';
import { PostStream } from '$lib/server/common-requests';

export const POST = PostStream(submitPromptForNewTopic);
