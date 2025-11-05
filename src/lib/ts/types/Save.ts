export type Save = {
	id?: IDBValidKey;
	name: string;
	saveType: string;
	created: Date;
	lastSaved: Date;
	version: string;
	cash: number;
	time: Date;

	data: SaveData;
};

export type SaveData = {
	gameProjects: any,
	companies: any,
	teams: any,
	hardwareProjects: any,
	newslist: any,
	platforms: any,
	publishers: any,
	gameFeatures: any,
	hardwareFeatures: any,
	buildings: any
};
