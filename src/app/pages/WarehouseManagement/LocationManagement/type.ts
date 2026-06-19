export interface ShowModalConfirmType {
	show?: boolean;
	data?: {
		id?: string;
		type?: string;
		code?: string;
		name?: string;
		priority?: string | number;
		areaId: string;
		aisleId?: string;
		rackId?: string;
		levelId?: string;
		length?: string;
		width?: string;
		height?: string;
		maxCapacity?: string;
		containerType?: string;
	};
}

export interface ShowModalDetailType {
	type?: string;
	dataDetail?: {
		id?: string;
		type?: string;
		code?: string;
		name?: string;
		priority?: string | number;
		areaId: string;
		aisleId?: string;
		rackId?: string;
		levelId?: string;
		length?: string;
		width?: string;
		height?: string;
		maxCapacity?: string;
	};
}
export interface ShowModalResultType {
	type?: string;
	dataResult?: {
		code?: string;
		error?: string;
	};
}
