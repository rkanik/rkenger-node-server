import { Router } from 'express'
import passport from 'passport'
import { authProviders } from '../auth/passport/configs'
import { _isDev } from '@consts'

import Users from '@models/users'

const router = Router()

router.route('/')
	.get((_, res) => {
		res.json({ Auth: true })
	})

router.post('/signin',
	passport.authenticate('local'),
	(req, res) => {
		res.status(200).json({
			success: true,
			data: req.user
		})
	}
)

router.get('/signout', (req, res) => {
	req.logout();
	res.redirect('/');
});


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

router.post('/signup', async (req, res) => {

	await Users.init()

	let user = new Users(req.body)

	// let isValid = user.validateSync()

	// console.log('/auth/signup', user, isValid)

	// if (!isValid) return res.json({ error: true, message: 'User not valid' })

	let newUser = await user.save()

	res.json(newUser)
})


export default router