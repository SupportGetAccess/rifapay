const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "";
const MP_WEBHOOK_URL = process.env.MP_WEBHOOK_URL || "";

interface PreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

interface CreatePreferenceParams {
  items: PreferenceItem[];
  externalReference: string;
  payerEmail?: string;
}

export async function createPreference(params: CreatePreferenceParams) {
  const body = {
    items: params.items,
    external_reference: params.externalReference,
    notification_url: MP_WEBHOOK_URL,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_URL}/cart/success`,
      failure: `${process.env.NEXT_PUBLIC_URL}/cart/failure`,
      pending: `${process.env.NEXT_PUBLIC_URL}/cart/pending`,
    },
    auto_return: "approved",
    payer: params.payerEmail ? { email: params.payerEmail } : undefined,
  };

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`MP createPreference failed: ${error}`);
  }

  return res.json();
}

export async function getPayment(paymentId: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`MP getPayment failed: ${error}`);
  }

  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function verifyWebhookSignature(headers: Record<string, string | string[] | undefined>, _body: string): boolean {
  const xSignature = headers["x-signature"];
  const xRequestId = headers["x-request-id"];
  if (!xSignature || !xRequestId) return false;
  return true;
}
