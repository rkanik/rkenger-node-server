import passport from 'passport'
import { Document, CallbackError } from 'mongoose';

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

passport.serializeUser((user: any, done) => done(null, user._id))
passport.deserializeUser((id, done) => {
	Users.findById(id, 'name role', {}, (err: CallbackError, user: any) => done(err, user))
})

export default passport