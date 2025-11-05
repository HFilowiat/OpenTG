import { Utility } from '$lib/ts/namespaces/Utility';
import type { Game } from '$lib/ts/classes/Game';
import { Random } from '$lib/ts/namespaces/Random';

export type Publisher = {
	id: string;
	name: string;
	percentage: number;
	whoDecidesPrice: 'publisher' | 'developer';
	gamesPublished: number;
	marketingBudget: number;
	size: 'small' | 'medium' | 'large' | 'giant' | 'global';
	lastContact: number;
	platformTags: string[];
	recentEstimates: { gameid: string; royaltyPercentage: number };
}

export function createPublisher(obj = undefined): Publisher { 
	return Object.assign({
		id: crypto.randomUUID(),
		name: '',
		percentage: 0,
		whoDecidesPrice: 'publisher',
		gamesPublished: 0,
		marketingBudget: 0,
		size: 'medium',
		lastContact: 0,
		platformTags: [],
		recentEstimates: {
			gameid: '',
			royaltyPercentage: 0.5
		}
	}, obj);
}
export function publisherestimateRoyalty(publisher: Publisher, game: Game, publisherlistOfPlatform: Publisher[]) {
		
		if (publisher.recentEstimates.gameid === game.id) {
			return publisher.recentEstimates.royaltyPercentage;
		}

		// publisher has monopoly on publishing raise the royalties
		const hasMonopoly = publisherlistOfPlatform.length === 1;

		const royalties =
			publisher.percentage + Random.Range(-0.25, 0.25) + (hasMonopoly ? Random.Range(0.1, 0.3) : 0);
		const royaltyClamped = Utility.clamp(royalties, 0.01, 0.9);

		publisher.recentEstimates.gameid = game.id;
		publisher.recentEstimates.royaltyPercentage = royaltyClamped;

		return royaltyClamped;
	}

