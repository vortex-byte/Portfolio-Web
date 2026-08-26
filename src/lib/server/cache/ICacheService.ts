export interface ICacheService {
	getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T>;
	get<T>(key: string): Promise<T | null>;
	set<T>(key: string, ttlSeconds: number, value: T): Promise<void>;
	delete(key: string): Promise<void>;
	invalidatePattern(pattern: string): Promise<void>;
}
