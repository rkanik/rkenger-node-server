import passport from 'passport'
import { CallbackError } from 'mongoose';

import {
	localStrategy,
	googleStrategy,
	githubStrategy,
} from './stategies'

import Users from '../../models/users'

// Stategies
passport.use(localStrategy)
passport.use(googleStrategy)
passport.use(githubStrategy)

passport.serializeUser((user: any, done) => {
	done(null, user._id);
});

passport.deserializeUser(function (id, done) {
	Users.findById(id, (err: CallbackError, user: any) => {
		console.log(
			new Date().toLocaleTimeString(),
			'deserializeUser',
			user.name,
			user.provider
		)
		done(err, user);
	});
});

export default passport