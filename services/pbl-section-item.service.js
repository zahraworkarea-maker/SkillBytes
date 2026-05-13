const PBLSectionItemService = (apiHandler) => {
	const baseUrl = "/api/pbl-items";
	const sectionsUrl = "/api/pbl-sections";

	/**
	 * Create a new section item
	 * @param {number} sectionId - Section ID
	 * @param {Object} data - Item data
	 * @returns {Promise} Created item response with message and data
	 */
	async function createItem(sectionId, data) {
		return apiHandler(`${sectionsUrl}/${sectionId}/items`, {
			method: "POST",
			data,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Update an existing item
	 * @param {number} id - Item ID
	 * @param {Object} data - Updated item data
	 * @returns {Promise} Updated item response with message and data
	 */
	async function updateItem(id, data) {
		return apiHandler(`${baseUrl}/${id}`, {
			method: "PUT",
			data,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Delete an item
	 * @param {number} id - Item ID
	 * @returns {Promise} Deleted item response with message and data
	 */
	async function deleteItem(id) {
		return apiHandler(`${baseUrl}/${id}`, {
			method: "DELETE",
		});
	}

	/**
	 * Save an item (create or update)
	 * @param {Object} item - Item data with optional id and sectionId
	 * @returns {Promise} Saved item response
	 */
	async function save(item) {
		if (item?.id) {
			return updateItem(item.id, item);
		}

		const { sectionId, ...data } = item;
		return createItem(sectionId, data);
	}

	return {
		createItem,
		updateItem,
		deleteItem,
		save,
	};
};

export default PBLSectionItemService;
