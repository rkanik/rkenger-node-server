import jwt from 'jsonwebtoken'

import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy } from 'passport-github2'

import { Users } from '@models'
import { AuthController } from '@controllers'

import { githubConfig, googleConfig } from './configs';
import { Profile } from 'passport'

export const localStrategy = new LocalStrategy(AuthController.logIn)

export const googleStrategy = new GoogleStrategy(googleConfig,
	async (request, accessToken, refreshToken, profile, done) => {

		console.log('GoogleStrategy', accessToken)
		console.log('GoogleStrategy', refreshToken)
		console.log('GoogleStrategy', profile)

		let existUser = await Users.findOne({ email: profile._json.email }).select("-__v")
		console.log('existUser', existUser)

		if (existUser) {
			let token = jwt.sign({ _id: existUser._id }, process.env.JWT_SECRET || "")
			console.log(token)
			Users.updateOne({ _id: existUser._id }, { lastVisited: Date.now() })
			// @ts-ignore
			return done(null, existUser._doc, "User already exist!")
		}

		let user = new Users({
			username: profile.displayName.replace(/ /g, '').toLocaleLowerCase(),
			name: profile.displayName,
			email: profile._json.email,
			emailVerified: profile._json.email_verified,
			externalId: profile.id,
			provider: profile.provider,
			thumbnail: profile._json.picture,
			password: ''
		})

		let isError = user.validateSync()
		console.log('isError', isError)
		if (isError !== undefined) {
			return done(undefined, undefined, "User validation error!")
		}

		await Users.init()

		user.save()
			.then(newUser => {
				console.log("User created successfully!")
				let token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET || '')
				console.log(token)
				done(undefined, newUser, "User created successfully!")
			})
			.catch(err => {
				console.log(err.message)
				done(err, undefined, err.message)
			})
	}
)

export const githubStrategy =
	new GitHubStrategy(githubConfig,
		(accessToken: string, refreshToken: string, profile: Profile, done: any) => {
			console.log('githubStrategy', accessToken)
			console.log('githubStrategy', refreshToken)
			console.log('githubStrategy', profile)
			return done(false, profile)
		}
	)