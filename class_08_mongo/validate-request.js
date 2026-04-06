export const validateRequest = (schema) => async (req, res, next) => {
  try {
    // We validate only req.body here, but the same pattern can validate params/query too.
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: "Invalid request data",
      details: error,
    });
  }
};
