const PBLSectionService = (apiHandler) => {
	const baseUrl = "/api/pbl-sections";
	const casesUrl = "/api/pbl-cases";

	/**
	 * Get sections by case ID
	 * @param {number} caseId - Case ID
	 * @param {Object} params - Query parameters
	 * @returns {Promise} Array of sections with items
	 */
	async function getSectionsByCase(caseId, params) {
		return apiHandler(`${casesUrl}/${caseId}/sections`, {
			method: "GET",
			params,
		});
	}

	/**
	 * Get a section by ID
	 * @param {number} id - Section ID
	 * @returns {Promise} Section response with message and data
	 */
	async function getSectionById(id) {
		return apiHandler(`${baseUrl}/${id}`, {
			method: "GET",
		});
	}

	/**
	 * Create a new section in a case
	 * @param {number} caseId - Case ID
	 * @param {Object} data - Section data
	 * @returns {Promise} Created section response with message and data
	 */
	async function createSection(caseId, data) {
		return apiHandler(`${casesUrl}/${caseId}/sections`, {
			method: "POST",
			data,
		});
	}

	/**
	 * Update an existing section
	 * @param {number} id - Section ID
	 * @param {Object} data - Updated section data
	 * @returns {Promise} Updated section response with message and data
	 */
	async function updateSection(id, data) {
		return apiHandler(`${baseUrl}/${id}`, {
			method: "PUT",
			data,
		});
	}

	/**
	 * Delete a section
	 * @param {number} id - Section ID
	 * @returns {Promise} Deleted section response with message and data
	 */
	async function deleteSection(id) {
		return apiHandler(`${baseUrl}/${id}`, {
			method: "DELETE",
		});
	}

	/**
	 * Save a section (create or update)
	 * @param {Object} section - Section data with optional id and caseId
	 * @returns {Promise} Saved section response
	 */
	async function save(section) {
		if (section?.id) {
			return updateSection(section.id, section);
		}

		const { caseId, ...data } = section;
		return createSection(caseId, data);
	}

	return {
		getSectionsByCase,
		getSectionById,
		createSection,
		updateSection,
		deleteSection,
		save,
	};
};

export default PBLSectionService;
