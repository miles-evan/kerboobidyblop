

export function mapObj<V>(
	obj: Record<string, any>,
	mapperFn: (value: any, key: string, obj: Record<string, any>) => V
): Record<string, any> {
	const result: any = { ...obj };
	mapObjInPlace(result, mapperFn);
	return result;
}

export function mapObjInPlace<V>(
	obj: Record<string, any>,
	mapperFn: (value: any, key: string, obj: Record<string, any>) => V
): void {
	for (const key in obj) {
		obj[key] = mapperFn(obj[key], key, obj);
	}
}