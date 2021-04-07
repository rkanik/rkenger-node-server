import { StrategyOptionsWithRequest as GoogleOptions } from "passport-google-oauth20";
import { StrategyOptions as GitHubOptions } from "passport-github2";

import {
	_baseUrl,
	_githubClientId,
	_githubClientSecret,
	_googleClientId,
	_googleClientSecret,
} from "../../consts";

export const authProviders = [
	{
		name: 'google',
		options: {
			scope: ['email', 'profile']
		}
	},
	{ name: 'github' },
]

export const googleConfig: GoogleOptions = {
	clientID: _googleClientId,
	clientSecret: _googleClientSecret,
	callbackURL: `${_baseUrl}/api/v1/auth/google/callback`,
	passReqToCallback: true
}

export const githubConfig: GitHubOptions = {
	clientID: _githubClientId,
	clientSecret: _githubClientSecret,
	callbackURL: `${_baseUrl}/api/v1/auth/github/callback`,
}