import { streamAiResponse, getAiResponse } from '$lib/server/domain/ai';
import { TopicRepo } from '$lib/server/topicRepo';
import type { DevelopmentInProgress, Topic } from '$lib/types';
import type { DomainService } from './types';
import {
	getQuestionPrompt,
	getSuggestionPrompt,
	ACCEPT_SUGGESTION_PROMPT,
	FINISH_EXPANSION_PROMPT,
	FINISH_REFINEMENT_PROMPT,
	getTopicPrompt
} from '$lib/server/domain/prompts';

export const getDevelopmentQuestion: DomainService<
	{ development: DevelopmentInProgress },
	ReadableStream<string>
> = async ({ topicId, userId, development }): Promise<ReadableStream<string>> => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);

	return streamAiResponse({
		messages: [
			{ role: 'user', content: getQuestionPrompt(topic, topicRepo, development) },
			...development.messages
		],
		temperature: 0.9
	});
};

export const getDevelopmentSuggestion: DomainService<
	{ development: DevelopmentInProgress },
	ReadableStream<string>
> = async ({ topicId, userId, development }): Promise<ReadableStream<string>> => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);

	return streamAiResponse({
		messages: [
			{ role: 'user', content: getSuggestionPrompt(topic, topicRepo, development) },
			...development.messages
		],

		temperature: 0.9
	});
};

export const acceptDevelopmentSuggestion: DomainService<
	{ development: DevelopmentInProgress },
	ReadableStream<string>
> = async ({ topicId, userId, development }): Promise<ReadableStream<string>> => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);

	return streamAiResponse({
		messages: [
			{ role: 'user', content: getSuggestionPrompt(topic, topicRepo, development) },
			...development.messages,
			{ role: 'user', content: ACCEPT_SUGGESTION_PROMPT }
		],
		temperature: 0.9
	});
};

export const submitDevelopmentPrompt: DomainService<
	{ prompt: string; development: DevelopmentInProgress },
	ReadableStream<string>
> = async ({ topicId, userId, prompt, development }): Promise<ReadableStream<string>> => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);

	const initial =
		development.mode === 'guide'
			? getQuestionPrompt(topic, topicRepo, development)
			: getSuggestionPrompt(topic, topicRepo, development);

	return streamAiResponse({
		messages: [
			{ role: 'user', content: initial },
			...development.messages,
			{ role: 'user', content: prompt }
		]
	});
};

const finishRefinement = async (
	topic: Topic,
	topicRepo: TopicRepo,
	development: DevelopmentInProgress
) => {
	const initialPrompt = getTopicPrompt(topic, topicRepo);

	const aiResponse = await getAiResponse({
		messages: [
			{ role: 'user', content: initialPrompt },
			...development.messages,
			{ role: 'user', content: FINISH_REFINEMENT_PROMPT }
		]
	});

	const newDescription = aiResponse;
	topic.developments = topic.developments ?? [];
	topic.developments.push({
		messages: development.messages,
		newDescription,
		type: development.type
	});
	topic.description = newDescription;
	await topicRepo.updateTopic(topic);
	return topic.id;
};

const finishExpansion = async (
	topic: Topic,
	topicRepo: TopicRepo,
	development: DevelopmentInProgress
) => {
	const initialPrompt = getTopicPrompt(topic, topicRepo);

	const aiResponse = await getAiResponse({
		messages: [
			{ role: 'user', content: initialPrompt },
			...development.messages,
			{ role: 'user', content: FINISH_EXPANSION_PROMPT }
		]
	});
	const newSubtopicJson = JSON.parse(aiResponse);
	if (!newSubtopicJson.title || !newSubtopicJson.summary) {
		throw new Error('Invalid subtopic format');
	}
	return await topicRepo.addTopic({
		title: newSubtopicJson.title,
		description: newSubtopicJson.summary,
		parentId: topic.id,
		developments: [
			{
				messages: development.messages,
				newDescription: newSubtopicJson.summary,
				type: development.type
			}
		]
	});
};

export const finishDeveloping: DomainService<
	{ development: DevelopmentInProgress },
	string
> = async ({ topicId, userId, development }) => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);

	if (development.type === 'refinement') {
		return await finishRefinement(topic, topicRepo, development);
	}
	return await finishExpansion(topic, topicRepo, development);
};
