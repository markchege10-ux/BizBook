// AI Scanner Service
// Sends receipt image to our Vercel proxy (/api/scan)
// which forwards it to Anthropic API securely server-side

export async function extractReceiptData(imageBase64, mimeType = "image/jpeg") {
    const prompt = `You are a receipt/invoice data extractor for a Kenyan bookkeeping app.
  
  Analyze this receipt or invoice image and extract the following fields.
  Respond ONLY with a JSON object, no markdown, no explanation, no backticks.
  
  Extract these fields:
  {
    "name": "supplier or customer business name",
    "receiptNo": "receipt or invoice number",
    "date": "date in YYYY-MM-DD format",
    "amount": "total amount as number only (no currency symbols)",
    "vat": "VAT amount as number only (0 if not shown)",
    "supplierPin": "KRA PIN if visible (e.g. P051234567X), empty string if not shown",
    "customerPin": "customer KRA PIN if visible, empty string if not shown",
    "paymentMethod": "cash, mpesa, bank, cheque or card",
    "productCategory": "general category of goods/services e.g. groceries, stationery, transport",
    "transactionType": "sale or purchase"
  }
  
  Rules:
  - If a field is not visible or unclear, use an empty string or 0 for numbers
  - For amount, extract the TOTAL/GRAND TOTAL value
  - For date, if only partial date visible, make your best guess
  - For transactionType: if it says ETR/receipt it is likely a sale, if invoice/LPO it is likely a purchase
  - All amounts should be numbers without commas or currency symbols`;
  
    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });
  
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || "AI extraction failed. Please fill in manually.");
    }
  
    const data = await response.json();
    const text = data.content?.map(b => b.text || "").join("").trim();
  
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      throw new Error("Could not read AI response. Please fill in manually.");
    }
  }
  
  // Convert image file to base64 string
  export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result.split(",")[1]);
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  }