import { TopicRepo } from '$lib/server/topicRepo';
import type { Topic, DevelopmentInProgress } from '$lib/types';

export const SYSTEM_PROMPT =
	'You are an assistant of an app designed to discover topics by structuring the users thoughts as well as providing information. You respond in a very concise manner while forming grammatically correct sentences. You do not act like a person would, you are a tool. You avoid greetings, thanks and other interpersonal phrases, focusing only on the topic.';

export const getTopicPrompt = (topic: Topic, topicRepo: TopicRepo): string => {
	const subtopics = topicRepo.getSubtopics(topic.id);
	const subtopicPrompt =
		subtopics.length > 0
			? `The existing subtopics are: ${subtopics.map((t) => `"${t.title}"`).join(', ')}\n`
			: '';
	return `The title of our topic is: "${topic.title}".\n${subtopicPrompt} The summary text of our topic is: "${topic.description}"`;
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
		? `You have already made these suggestions: ${previous.map((p) => `"${p}"`).join('\n')}\nEnd of suggestions.`
		: '';
};

export const ACCEPT_SUGGESTION_PROMPT = 'Accept';

export const REFINEMENT_QUESTION_PROMPT =
	'During this conversation, always respond with only one question in one sentence to help me discover more detail about the topic.';

export const EXPANSION_QUESTION_PROMPT =
	'During this conversation, always respond with only one question in one sentence which should help me discover a new subtopic. The subtopic should not relate to information that is already in the summary. The conversation is only about one new subtopic. The question should not suggest a subtopic but rather ask a question that would lead to a subtopic and deepen it. Once I have answered, you should ask followup questions to help me understand the subtopic better.';

export const REFINEMENT_SUGGESTION_PROMPT =
	'Help me by giving me a new idea that expands on the topic. You should suggest a new idea rather than suggest a way to arrive at a new idea. During this conversation you always only respond with a suggestion, making sure not to reapeat any information that is already in the summary. You also make sure that your suggestion is not similar to a previous one. If I respond with "Accept" then the suggestion will be added to the topic.';

export const EXPANSION_SUGGESTION_PROMPT =
	'Help me discover a new subtopic by giving me a new idea that expands on the topic. You should suggest a new idea rather than suggest a way to arrive at a new idea. During this conversation you always only respond with a suggestion, making sure not to reapeat any information that is already in the summary. You also make sure that your suggestion is not similar to a previous one. This conversation is about a single new subtopic. If I respond with "Accept" then the sentence will be added to the new subtopic summary. Only make make suggestions that relate to the accepted subtopic.';

export const FINISH_REFINEMENT_PROMPT =
	'Based on our conversation, adjust the original topic summary by incoporating the newly discovered information. Do not remove anything from the original summary, rather expand it with the new infomation. Make the added information as brief as possible while remaining grammatically correct. Only respond with the updated topic summary.';

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

export const getSplitTopicPrompt = (topic: Topic, topicRepo: TopicRepo) => {
	const topicPrompt = getTopicPrompt(topic, topicRepo);
	return `${topicPrompt}\nYour task is to split out 2-4 new subtopics from the main topic. The new subtopic summaries should be as close to the corresponding text passages in the original summary as possible while being grammatically correct and forming full sentences. The titles should be only a few words long. The information that has been extracted into subtopics should be removed from the original topic summary. Respond only with the updated topic summary and the summaries and titles for the new subtopics in the json format: {"summary": "string", "subtopics": [{"summary": "string", "title": "string"}]}`;
};

export const getCategorizePrompt = (topic: Topic, topicRepo: TopicRepo) => {
	const topicPrompt = getTopicPrompt(topic, topicRepo);
	return `${topicPrompt}\nDivide the subtopics into no more than 3 categories with a title with a few words. The categories should allow adding more similar subtopics. Respond only in json format [{"title": "string", "summary": "string", "subtopics": ["string"]}]`;
};

export const getFinishExpansionPrompt = (topic: Topic, topicRepo: TopicRepo) => {
	return `Based on the new information in our conversation, formulate a new subtopic. The subtopic should only contain new information that is not already in the summary. The new subtopic summary should be concise while being grammatically correct with subject, verb and object. The title should be only a few words long. Respond only with a title and summary for the new subtopic in the json format: {"title": "string", "summary": "string"}`;
};

export const NEW_TOPIC_PROMPT =
	'Summarize this conversation. The summary should contain the critical information of the conversation, such that you would not need to read the conversation. This means it should not describe what the conversation is about, but rather provide the information that was learned from the conversation. It should be very concise while being grammatically correct with subject, verb and object. It should countain paragraphs using the escaped characters \\n\\n where there are semantically distinct parts, if there are any, to increase readability. The title should be only a few words long. Your response should be a valid JSON document with the title and summary in the format: {"title": "string", "summary": "string"}';
