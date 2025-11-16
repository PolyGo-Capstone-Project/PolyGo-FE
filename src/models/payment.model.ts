import z from "zod";

// POST deposit payment
export const DepositPaymentBodySchema = z
  .object({
    amount: z.number().min(2000).max(5000000),
    returnUrl: z.string(),
    cancelUrl: z.string(),
  })
  .strict();

export const DepositPaymentResSchema = z.object({
  data: z.object({
    depositUrl: z.string(),
    orderCode: z.string(),
  }),
  message: z.string(),
});

// cancel payment req
export const CancelPaymentBodySchema = z
  .object({
    orderCode: z.number(),
  })
  .strict();

// types
export type DepositPaymentBodyType = z.infer<typeof DepositPaymentBodySchema>;
export type DepositPaymentResType = z.infer<typeof DepositPaymentResSchema>;
export type CancelPaymentBodyType = z.infer<typeof CancelPaymentBodySchema>;
