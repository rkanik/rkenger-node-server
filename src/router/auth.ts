import passport from 'passport'
import { Router } from 'express'
import { authProviders } from '../auth/passport/configs'
import { _isDev } from '@consts'

import { auth } from "@controllers"

const router = Router()

router.route('/')
	.get((_, res) => {
		res.json({ Auth: true })
	})

router.post('/login', auth.verifyAuth, passport.authenticate('local'), auth.onLoggedIn)
router.post('/register', auth.signup)

router.get('/logout', auth.signout);


for (let { name, options } of authProviders) {
	router.get(`/${name}`, options
		? passport.authenticate(name, options)
		: passport.authenticate(name)
	)

	router.get(`/${name}/callback`,
		passport.authenticate(name, {
			successRedirect: `/?success=true&provider=${name}`,
			failureRedirect: `/auth/${name}?error=true,message=Unexpected error while signing in!`
		})
	)
}

export default router