import passport from 'passport'
import { Router } from 'express'
import { AuthController } from "@controllers"
import { authProviders } from '../auth/passport/configs'
import { _isDev } from '@consts'
import { verifyToken } from '@middlewares'


const router = Router()

router.route('/').get(AuthController.isAuthenticated)
router.route('/profile').get(verifyToken, AuthController.getProfile)

router.post('/login',
	AuthController.verifyAuth,
	passport.authenticate('local'),
	AuthController.onLoggedIn
)

router.post('/register', AuthController.signup)
router.post('/logout', AuthController.signout);
router.post('/refresh-token', AuthController.newToken)

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