/**
 * Utility function to fetch data from API
 * @param {string} endpoint - API endpoint to fetch from
 * @returns {Promise<any>} - Response data
 */
export async function fetchFromApi(endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
} 