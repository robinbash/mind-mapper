export type DomainService<TParams, TReturn> = (
	params: { topicId: string; userId: string } & TParams
) => Promise<TReturn>;
