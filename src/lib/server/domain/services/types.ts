export type DomainService<TParams, TReturn> = (
	params: { userId: string } & TParams
) => Promise<TReturn>;
