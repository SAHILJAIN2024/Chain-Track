export const processInvoiceFromUrl = async (imageUrl) => {
  const response = await fetch("http://localhost:8000/ocr-from-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    throw new Error("OCR service failed");
  }

  const data = await response.json();
  return data;
};