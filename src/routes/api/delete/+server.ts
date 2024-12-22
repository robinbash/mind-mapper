import { PostSimple } from '$lib/server/common-requests';
import { deleteNode } from '$lib/server/domain';

export const POST = PostSimple(deleteNode);
