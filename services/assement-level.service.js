const AssessmentLevelService = (apiHandler) => {
	const url = "/assessment-levels";

	/**
	 * List assessment levels (optionally with query params)
	 * @param {Object} params - Query parameters (page, per_page, search)
	 * @returns {Promise}
	 */
	async function retrieve(params) {
		return apiHandler(url, {
			method: "GET",
			params,
		});
	}

	/**
	 * Get a single assessment level by id (includes assessments)
	 * @param {number|string} id
	 * @returns {Promise}
	 */
	async function retrieveById(id) {
		return apiHandler(`${url}/${id}`, {
			method: "GET",
		});
	}

	/**
	 * Create a new assessment level
	 * @param {Object} req - payload
	 * @returns {Promise}
	 */
	async function create(req) {
		return apiHandler(url, {
			method: "POST",
			data: req,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Update an existing assessment level
	 * @param {number|string} id
	 * @param {Object} req - payload
	 * @returns {Promise}
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
	 * Delete an assessment level
	 * @param {number|string} id
	 * @returns {Promise}
	 */
	async function destroy(id) {
		return apiHandler(`${url}/${id}`, {
			method: "DELETE",
		});
	}

	/**
	 * Save helper: create or update depending on presence of id
	 * @param {Object} req
	 * @returns {Promise}
	 */
	async function save(req) {
		if (req?.id) {
			return update(req.id, req);
		}

		return create(req);
	}

	return {
		retrieve,
		retrieveById,
		create,
		update,
		destroy,
		save,
	};
};

export default AssessmentLevelService;
