export const formatCurrency = (
  value: number | null | undefined,
  locale: string
) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value);

  return `${formatted} VNĐ`;
};

export const formatInteger = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return value.toLocaleString();
};

/** Rút gọn số lớn: 1500 -> 1.5K, 2000000 -> 2.0M */
export const formatShortNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const n = value;
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};
