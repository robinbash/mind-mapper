import { streamAiResponse, getAiResponse } from './ai';
import { TopicRepo } from '$lib/server/topicRepo';
import type { Message, Topic } from './types';

export type DomainService<TParams, TReturn> = (
	params: { topicId: string; userId: string } & TParams
) => Promise<TReturn>;

const getDevelopmentPrompt = (topic: Topic, previousQuestions?: string[]): Message => {
	const previousDevelopmentQuestions =
		topic.developments
			?.map((d) => d.messages.filter((m) => (m.role = 'assistant')).map((m) => m.content))
			.flat() ?? [];
	const previous: string[] = [...previousDevelopmentQuestions, ...(previousQuestions ?? [])];
	const previousQuestionsPrompt =
		previous.length > 0
			? `You have already asked me these questions before: ${previous.join('\n')}\n`
			: '';

	const prompt = `${previousQuestionsPrompt}The title of our topic is: ${topic.title}. The summary of our topic is: ${topic.description}. Always respond with only one question in one sentence to help me discover more detail about the topic.`;
	return { role: 'user', content: prompt };
};

export const getDevelopmentGuidance: DomainService<
	{ previousQuestions?: string[] },
	ReadableStream<string>
> = async ({ topicId, userId, previousQuestions }): Promise<ReadableStream<string>> => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);

	return streamAiResponse({
		messages: [getDevelopmentPrompt(topic, previousQuestions)],
		temperature: 0.9
	});
};

export const finishDeveloping: DomainService<{ messages: Message[] }, void> = async ({
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

	topic.developments = topic.developments ?? [];
	topic.developments.push({ messages, newDescription });
	topic.description = newDescription;

	await topicRepo.updateTopic(topic);
};

export const submitDevelopmentPrompt: DomainService<
	{ content: string; previousMessages: Message[] },
	ReadableStream<string>
> = async ({ topicId, userId, content, previousMessages }): Promise<ReadableStream<string>> => {
	console.log('previous', previousMessages);
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);
	const initial = getDevelopmentPrompt(topic);
	return streamAiResponse({
		messages: [initial, ...previousMessages, { role: 'user', content }]
	});
};
