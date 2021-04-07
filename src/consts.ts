import express from 'express'

export const app = express()

export const _isProd = app.get('env') === 'production'
export const _isDev = app.get('env') === 'development'

export const _port = process.env.PORT || '3500'
export const _baseUrl = _isDev
	? `http://localhost:${_port}`
	: 'https://rk-passport-auth.herokuapp.com'

export const _sessionSecret = process.env.SESSION_SECRET || ''
export const _cookieSecret = process.env.COOKIE_SECRET || ''
export const _jwtSecret = process.env.JWT_SECRET || ''

export const _mongodbConnectionString = process.env.MONGO_ATLAS || process.env.MONGO_LOCAL || ''

export const _googleClientId = process.env.GOOGLE_CLIENT_ID || ''
export const _googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || ''

export const _githubClientId = process.env.GITHUB_CLIENT_ID || ''
export const _githubClientSecret = process.env.GITHUB_CLIENT_SECRET || ''

export enum _roles {
	Admin = 'Admin',
	User = 'User'
}

export const _saltRounds = 10

export const _time = (() => {
  let sec = 1000
  let min = sec * 60
  let hour = min * 60
  let day = hour * 24
  let week = day * 7
  let month = day * 30
  let year = day * 365
  return {
    sec, min, hour,
    day, week, month, year
  }
})()