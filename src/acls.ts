import { AccessControl } from 'accesscontrol'

let grantsObject = {
	admin: {
		video: {
			'create:any': ['*', '!views'],
			'read:any': ['*'],
			'update:any': ['*', '!views'],
			'delete:any': ['*']
		}
	},
	user: {
		video: {
			'create:own': ['*', '!rating', '!views'],
			'read:own': ['*'],
			'update:own': ['*', '!rating', '!views'],
			'delete:own': ['*']
		}
	}
};

export default new AccessControl(grantsObject);