"use client";

import React from "react";

type Token = {
  id: string | number;
  metadata: {
    image: string;
  };
};

type Props = {
  token: Token;
};

export default function InvoiceProcessor({ token }: Props) {
  const processInvoice = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/process-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenId: token.id,
          imageUrl: token.metadata.image,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to process invoice");
      }

      const data = await res.json();
      console.log("Processed Invoice:", data);

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <button
      onClick={processInvoice}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Process Invoice
    </button>
  );
}