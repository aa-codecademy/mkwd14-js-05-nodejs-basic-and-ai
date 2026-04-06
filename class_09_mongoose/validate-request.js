export const validateRequest = (schema) => async (req, res, next) => {
  try {
    // Validate incoming body against the provided Zod schema.
    // If validation passes, request continues to the endpoint handler.
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
