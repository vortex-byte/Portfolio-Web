import { SignJWT, jwtVerify } from 'jose';
import { env } from '$lib/server/env';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export interface JwtPayload {
	sub: string;
	email: string;
	name: string;
	tokenVersion: number;
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
	return new SignJWT({ ...payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
		.setIssuedAt()
		.sign(accessSecret);
}

export async function signRefreshToken(payload: JwtPayload): Promise<string> {
	return new SignJWT({ ...payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
		.setIssuedAt()
		.sign(refreshSecret);
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
	const { payload } = await jwtVerify(token, accessSecret);
	return payload as unknown as JwtPayload;
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
	const { payload } = await jwtVerify(token, refreshSecret);
	return payload as unknown as JwtPayload;
}
