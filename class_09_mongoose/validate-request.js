export const validateRequest = schema => async (req, res, next) => {
	console.log(req.body);
	console.log(req.params);
	console.log(req.query);
	try {
		await schema.parseAsync(req.body);
		next();
	} catch (error) {
		console.log(error);
		res.status(400).json({
			status: 400,
			message: 'Invalid request data',
			details: error,
		});
	}
};
