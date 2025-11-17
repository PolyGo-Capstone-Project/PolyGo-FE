import type { Metadata } from "next";

import TransactionContent from "./transaction-content";

export const metadata: Metadata = {
  title: "Manage Transactions - PolyGo",
  description: "Manage transactions on the PolyGo platform",
};

export default function Page() {
  return <TransactionContent />;
}
