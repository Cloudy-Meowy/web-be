exports.callApi = async (url, data) => {
  try {
    const queryString = new URLSearchParams(data).toString();
    const fullUrl = `${url}?${queryString}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Lấy response body dạng text để debug
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Error calling API:", error);
    throw error;
  }
};
