export const required = (fieldName: string) => {
	return {
		message: `${fieldName} is required.`,
		errors: {
			[fieldName]: `${fieldName} is required.`
		}
	}
}

export const notMatched = (fieldName: string) => {
	return {
		message: `${fieldName} not matched.`,
		errors: {
			[fieldName]: `${fieldName} not matched.`
		}
	}
}

export default {
	required, notMatched
}