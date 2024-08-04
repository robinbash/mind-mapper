import { streamAiResponse, getAiResponse } from './ai';
import { TopicRepo } from '$lib/server/topicRepo';
import type { Message, Topic } from './types';

export type DomainService<TParams, TReturn> = (
	params: { topicId: string; userId: string } & TParams
) => Promise<TReturn>;

const getRefinementPrompt = (topic: Topic, previousQuestions?: string[]): Message => {
	const previousRefinementQuestions =
		topic.refinements
			?.map((d) => d.messages.filter((m) => (m.role = 'assistant')).map((m) => m.content))
			.flat() ?? [];
	const previous: string[] = [...previousRefinementQuestions, ...(previousQuestions ?? [])];
	const previousQuestionsPrompt =
		previous.length > 0
			? `You have already asked me these questions before: ${previous.join('\n')}\n`
			: '';

	const prompt = `${previousQuestionsPrompt}The title of our topic is: ${topic.title}. The summary of our topic is: ${topic.description}. Always respond with only one question in one sentence to help me discover more detail about the topic.`;
	return { role: 'user', content: prompt };
};

export const getRefinementGuidance: DomainService<
	{ previousQuestions?: string[] },
	ReadableStream<string>
> = async ({ topicId, userId, previousQuestions }): Promise<ReadableStream<string>> => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);

	return streamAiResponse({
		messages: [getRefinementPrompt(topic, previousQuestions)],
		temperature: 0.9
	});
};

export const finishRefining: DomainService<{ messages: Message[] }, void> = async ({
	topicId,
	userId,
	messages
}) => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);

	const initialPrompt = `The the title of our topic is: ${topic.title}. The summary of our topic is: ${topic.description}`;
	const finishPrompt =
		'Based on our conversation, adjust the original topic summary by incoporating the newly discovered information. Do not remove anything from the original summary, rather expand it with the new infomation. Make the added information as brief as possible while remaining grammatically correct. Only respond with the updated topic summary.';

	const newDescription = await getAiResponse({
		messages: [
			{ role: 'user', content: initialPrompt },
			...messages,
			{ role: 'user', content: finishPrompt }
		]
	});

	topic.refinements = topic.refinements ?? [];
	topic.refinements.push({ messages, newDescription });
	topic.description = newDescription;

	await topicRepo.updateTopic(topic);
};

export const submitRefinementPrompt: DomainService<
	{ content: string; previousMessages: Message[] },
	ReadableStream<string>
> = async ({ topicId, userId, content, previousMessages }): Promise<ReadableStream<string>> => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);
	const initial = getRefinementPrompt(topic);
	return streamAiResponse({
		messages: [initial, ...previousMessages, { role: 'user', content }]
	});
};

const getExpansionPrompt = (
	topic: Topic,
	subtopics: Topic[],
	previousQuestions?: string[]
): Message => {
	const previousRefinementQuestions =
		topic.refinements
			?.map((d) => d.messages.filter((m) => (m.role = 'assistant')).map((m) => m.content))
			.flat() ?? [];
	const previous: string[] = [...previousRefinementQuestions, ...(previousQuestions ?? [])];
	const previousQuestionsPrompt =
		previous.length > 0
			? `You have already asked me these questions before: ${previous.join('\n')}\n`
			: '';

	const subtopicPrompt =
		subtopics.length > 0
			? `The existing subtopics are:\n${subtopics.map((t) => t.title).join('\n')}\n`
			: '';

	const prompt = `${previousQuestionsPrompt}The title of our topic is: ${topic.title}. The summary of our topic is: ${topic.description}\n${subtopicPrompt}Always respond with only one question in one sentence which should help me discover a new subtopic. The subtopic should not relate to information that is already in the summary. The question should not suggest a subtopic but rather ask a question that would lead to a subtopic.`;

	return { role: 'user', content: prompt };
};

export const getExpansionGuidance: DomainService<
	{ previousQuestions?: string[] },
	ReadableStream<string>
> = async ({ topicId, userId, previousQuestions }): Promise<ReadableStream<string>> => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);
	const subtopics = topicRepo.getSubtopics(topicId);

	return streamAiResponse({
		messages: [getExpansionPrompt(topic, subtopics, previousQuestions)],
		temperature: 0.9
	});
};

export const finishExpanding: DomainService<{ messages: Message[] }, void> = async ({
	topicId,
	userId,
	messages
}) => {
	return;
};

export const submitExpansionPrompt: DomainService<
	{ content: string; previousMessages: Message[] },
	ReadableStream<string>
> = async ({ topicId, userId, content, previousMessages }): Promise<ReadableStream<string>> => {
	return new ReadableStream<string>();
};
