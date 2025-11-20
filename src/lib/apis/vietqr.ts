import z from "zod";

// VietQR Bank Schema
export const VietQRBankSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  bin: z.string(),
  shortName: z.string(),
  logo: z.string(),
  transferSupported: z.number(),
  lookupSupported: z.number(),
  short_name: z.string(),
  support: z.number(),
  isTransfer: z.number(),
  swift_code: z.string().nullable(),
});

export const VietQRBanksResponseSchema = z.object({
  code: z.string(),
  desc: z.string(),
  data: z.array(VietQRBankSchema),
});

export type VietQRBankType = z.infer<typeof VietQRBankSchema>;
export type VietQRBanksResponseType = z.infer<typeof VietQRBanksResponseSchema>;

// Fetch banks from VietQR API
export async function fetchVietQRBanks(): Promise<VietQRBankType[]> {
  try {
    const response = await fetch("https://api.vietqr.io/v2/banks");
    const json = await response.json();
    const parsed = VietQRBanksResponseSchema.parse(json);
    return parsed.data;
  } catch (error) {
    console.error("Failed to fetch VietQR banks:", error);
    return [];
  }
}
