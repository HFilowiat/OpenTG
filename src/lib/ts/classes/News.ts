import { language, newslist } from '$lib/ts/stores/Stores';
import { get } from 'svelte/store';

export type News = {
	id: string;
	name: string;
	content?: string;
	date: Date;
	seen: boolean;
	type: 'PRODUCT_RELEASED' | 'PRODUCT_DISCONTINUED';
}

export function createNews() : News { 
	return {
		id: crypto.randomUUID(),
		name: '',
		content: undefined,
		date: new Date(),
		seen: false,
		type: 'PRODUCT_RELEASED'
	};
}

export function createNewsWithProp(name: string, date: Date, type: 'PRODUCT_RELEASED' | 'PRODUCT_DISCONTINUED') {
	const news = createNews();
	news.name = name;
	news.date = date;
	news.type = type;
	newslist.add(news);
}

export function getNewsHeader(news: News): string {
		if (news.type === 'PRODUCT_RELEASED') {
			return `${news.name} ${get(language).HAS_BEEN_RELEASED}`;
		}

		if (news.type === 'PRODUCT_DISCONTINUED') {
			return `${news.name} ${get(language).HAS_BEEN_DISCONTINUED}`;
		}

		return '';
	}
