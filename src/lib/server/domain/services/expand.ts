import { streamAiResponse, getAiResponse } from '$lib/server/domain/ai';
import { TopicRepo } from '$lib/server/topicRepo';
import type { DevelopmentMessage, UserMessage, Topic } from '$lib/types';
import type { DomainService } from './types';

const getExpansionPrompt = (
	topic: Topic,
	subtopics: Topic[],
	previousQuestions?: string[]
): UserMessage => {
	const previousRefinementQuestions =
		topic.developments
			?.map((d) =>
				d.messages
					.filter((m) => m.role === 'assistant' && m.type === 'question')
					.map((m) => m.content)
			)
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

	const prompt = `${previousQuestionsPrompt}The title of our topic is: ${topic.title}. The summary of our topic is: ${topic.description}\n${subtopicPrompt}Always respond with only one question in one sentence which should help me discover a new subtopic. The subtopic should not relate to information that is already in the summary. The question should not suggest a subtopic but rather ask a question that would lead to a subtopic. Once I have answered, you should ask followup questions to help me understand the subtopic better.`;

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

export const submitExpansionPrompt: DomainService<
	{ prompt: string; previousMessages: DevelopmentMessage[] },
	ReadableStream<string>
> = async ({ topicId, userId, prompt, previousMessages }): Promise<ReadableStream<string>> => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);
	const subtopics = topicRepo.getSubtopics(topicId);
	const initial = getExpansionPrompt(topic, subtopics);
	return streamAiResponse({
		messages: [initial, ...previousMessages, { role: 'user', content: prompt }]
	});
};

export const finishExpanding: DomainService<{ messages: DevelopmentMessage[] }, string> = async ({
	topicId,
	userId,
	messages
}) => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);
	const subtopics = topicRepo.getSubtopics(topicId);

	const subtopicPrompt =
		subtopics.length > 0
			? `The existing subtopics are:\n${subtopics.map((t) => t.title).join('\n')}\n`
			: '';

	const initialPrompt = `The title of our topic is: ${topic.title}. The summary of our topic is: ${topic.description}\n${subtopicPrompt}`;

	const finishPrompt =
		'Based on the new information in our conversation, formulate a new subtopic. The subtopic should only contain new information that is not already in the summary. Repond only with a title and summary for the new subtopic in the format: {"title": "string", "summary": "string"}';

	const newSubtopic = await getAiResponse({
		messages: [
			{ role: 'user', content: initialPrompt },
			...messages,
			{ role: 'user', content: finishPrompt }
		]
	});

	const newSubtopicJson = JSON.parse(newSubtopic);
	if (!newSubtopicJson.title || !newSubtopicJson.summary) {
		throw new Error('Invalid subtopic format');
	}

	return await topicRepo.addTopic({
		title: newSubtopicJson.title,
		description: newSubtopicJson.summary,
		parentId: topicId,
		developments: [
			{
				messages,
				newDescription: newSubtopicJson.summary,
				type: 'expansion'
			}
		]
	});
};
