import { TopicRepo } from '$lib/server/topicRepo';
import type { Topic, DevelopmentInProgress } from '$lib/types';

export const SYSTEM_PROMPT =
	'You are an assistant of an app designed to discover topics by structuring the users thoughts as well as providing information. You respond in a very concise manner while forming grammatically correct sentences. You do not act like a person would, you are a tool. You avoid greetings, thanks and other interpersonal phrases, focusing only on the topic.';

export const getTopicPrompt = (topic: Topic, topicRepo: TopicRepo): string => {
	const subtopics = topicRepo.getSubtopics(topic.id);
	const subtopicPrompt =
		subtopics.length > 0
			? `The existing subtopics are:\n${subtopics.map((t) => t.title).join('\n')}\n`
			: '';
	return `The title of our topic is: ${topic.title}.\n${subtopicPrompt} The summary text of our topic is: ${topic.description} - End topic summary.`;
};

export const getPreviousQuestionsPrompt = (topic: Topic, development: DevelopmentInProgress) => {
	const previousDevQuestions =
		topic.developments
			?.map((d) =>
				d.messages
					.filter((m) => m.role === 'assistant' && m.type === 'question')
					.map((m) => m.content)
			)
			.flat() ?? [];

	const previous: string[] = [...previousDevQuestions, ...(development.previousQuestions ?? [])];
	return previous.length > 0
		? `You have already asked me these questions before: ${previous.join('\n')}\n`
		: '';
};

export const getPreviousSuggestionsPrompt = (topic: Topic, development: DevelopmentInProgress) => {
	const previousDevSuggestions =
		topic.developments
			?.map((d) =>
				d.messages
					.filter((m) => m.role === 'assistant' && m.type === 'suggestion')
					.map((m) => m.content)
			)
			.flat() ?? [];

	const previous: string[] = [
		...previousDevSuggestions,
		...(development.previousSuggestions ?? [])
	];
	return previous.length > 0
		? `You have already made these predictions: ${previous.join('\n')}\nEnd predictions.`
		: '';
};

export const ACCEPT_SUGGESTION_PROMPT = 'Accept';

export const REFINEMENT_QUESTION_PROMPT =
	'During this conversation, always respond with only one question in one sentence to help me discover more detail about the topic.';

export const EXPANSION_QUESTION_PROMPT =
	'During this conversation, always respond with only one question in one sentence which should help me discover a new subtopic. The subtopic should not relate to information that is already in the summary. The question should not suggest a subtopic but rather ask a question that would lead to a subtopic. Once I have answered, you should ask followup questions to help me understand the subtopic better.';

export const REFINEMENT_SUGGESTION_PROMPT =
	'Help me expand the topic summary by predicting the next sentence of the summary text. During this conversation you always only respond with the next sentence of the summary, making sure not to reapeat any information that is already in the summary. You also make sure that your prediction is not similar to a previous one. If I respond with "Accept" then the sentence will be added to the topic summary.';

export const EXPANSION_SUGGESTION_PROMPT = '';

export const FINISH_REFINEMENT_PROMPT =
	'Based on our conversation, adjust the original topic summary by incoporating the newly discovered information. Do not remove anything from the original summary, rather expand it with the new infomation. Make the added information as brief as possible while remaining grammatically correct. Only respond with the updated topic summary.';

export const FINISH_EXPANSION_PROMPT =
	'Based on the new information in our conversation, formulate a new subtopic. The subtopic should only contain new information that is not already in the summary. Repond only with a title and summary for the new subtopic in the format: {"title": "string", "summary": "string"}';

export const getQuestionPrompt = (
	topic: Topic,
	topicRepo: TopicRepo,
	development: DevelopmentInProgress
) => {
	const topicPrompt = getTopicPrompt(topic, topicRepo);
	const previousQuestionsPrompt = getPreviousQuestionsPrompt(topic, development);
	const questionPrompt =
		development.type === 'refinement'
			? REFINEMENT_QUESTION_PROMPT
			: development.type === 'expansion'
				? EXPANSION_QUESTION_PROMPT
				: '';
	return `${topicPrompt}\n${previousQuestionsPrompt}\n${questionPrompt}`;
};

export const getSuggestionPrompt = (
	topic: Topic,
	topicRepo: TopicRepo,
	development: DevelopmentInProgress
) => {
	const topicPrompt = getTopicPrompt(topic, topicRepo);
	const previousSuggestionsPrompt = getPreviousSuggestionsPrompt(topic, development);
	const suggestionPrompt =
		development.type === 'refinement'
			? REFINEMENT_SUGGESTION_PROMPT
			: development.type === 'expansion'
				? EXPANSION_SUGGESTION_PROMPT
				: '';
	return `${topicPrompt}\n${previousSuggestionsPrompt}\n${suggestionPrompt}`;
};
