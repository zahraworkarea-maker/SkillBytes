const QuestionService = (apiHandler) => {
	const url = "/questions";

	/**
	 * Create a new question for assessment
	 * @param {number} assessmentId - Assessment ID
	 * @param {Object} req - Question data
	 * @returns {Promise} Created question response with message and data
	 */
	async function create(assessmentId, req) {
			const isForm = typeof FormData !== 'undefined' && req instanceof FormData;
			return apiHandler(`/assessments/${assessmentId}/questions`, {
				method: "POST",
				data: req,
				headers: isForm ? {} : { "Content-Type": "application/json" },
			});
	}

	/**
	 * Update an existing question
	 * @param {number} id - Question ID
	 * @param {Object} req - Updated question data
	 * @returns {Promise} Updated question response with message and data
	 */
	async function update(id, req) {
			const isForm = typeof FormData !== 'undefined' && req instanceof FormData;
			return apiHandler(`${url}/${id}`, {
				method: "PUT",
				data: req,
				headers: isForm ? {} : { "Content-Type": "application/json" },
			});
	}

	/**
	 * Delete a question
	 * @param {number} id - Question ID
	 * @returns {Promise} Deleted question response with message and data
	 */
	async function destroy(id) {
		return apiHandler(`${url}/${id}`, {
			method: "DELETE",
		});
	}

	/**
	 * Save a question (create or update)
	 * @param {number} assessmentId - Assessment ID (required for create)
	 * @param {Object} req - Question data with optional id
	 * @returns {Promise} Saved question response
	 */
	async function save(assessmentId, req) {
		if (req?.id) {
			return update(req.id, req);
		}

		return create(assessmentId, req);
	}

	return {
		create,
		update,
		destroy,
		save,
	};
};

export default QuestionService;
