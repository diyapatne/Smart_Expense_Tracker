import api from "../api/axios";

export async function downloadFile(endpoint, filename, params = {}) {
  try {
    const response = await api.get(endpoint, {
      responseType: "blob",
      params,
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Download failed. Please try again.");
  }
}