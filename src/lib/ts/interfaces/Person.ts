import type { Sex } from '../enums/Sex';
import type { CharacterEffects } from './CharacterEffects';

export interface Person {
	readonly sex: Sex;
	readonly nationality: number;
	readonly dateOfBirth: Date;
	readonly placeOfBirth: string;
	readonly fullName: string;
	readonly effects: CharacterEffects;
}
