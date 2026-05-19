const OptionService = (apiHandler) => {
	const url = "/options";

	/**
	 * Create a new option for question
	 * @param {number} questionId - Question ID
	 * @param {Object} req - Option data
	 * @returns {Promise} Created option response with message and data
	 */
	async function create(questionId, req) {
		return apiHandler(`/questions/${questionId}/options`, {
			method: "POST",
			data: req,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Update an existing option
	 * @param {number} id - Option ID
	 * @param {Object} req - Updated option data
	 * @returns {Promise} Updated option response with message and data
	 */
	async function update(id, req) {
		return apiHandler(`${url}/${id}`, {
			method: "PUT",
			data: req,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Delete an option
	 * @param {number} id - Option ID
	 * @returns {Promise} Deleted option response with message and data
	 */
	async function destroy(id) {
		return apiHandler(`${url}/${id}`, {
			method: "DELETE",
		});
	}

	/**
	 * Save an option (create or update)
	 * @param {number} questionId - Question ID (required for create)
	 * @param {Object} req - Option data with optional id
	 * @returns {Promise} Saved option response
	 */
	async function save(questionId, req) {
		if (req?.id) {
			return update(req.id, req);
		}

		return create(questionId, req);
	}

	return {
		create,
		update,
		destroy,
		save,
	};
};

export default OptionService;
