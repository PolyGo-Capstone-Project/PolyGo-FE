"use client";

import { IconAlertCircle, IconCash, IconFileText } from "@tabler/icons-react";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InquiriesTab } from "./tabs/inquiries-tab";
import { TransactionLogsTab } from "./tabs/transaction-logs-tab";
import { WithdrawalRequestsTab } from "./tabs/withdrawal-requests-tab";

export default function TransactionContent() {
  const [activeTab, setActiveTab] = useState("logs");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Transaction Management
        </h1>
        <p className="text-muted-foreground">
          Manage all transactions, withdrawal requests, and inquiries on the
          PolyGo platform.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="logs">
            <IconFileText className="h-4 w-4" />
            Transaction Logs
          </TabsTrigger>
          <TabsTrigger value="withdrawals">
            <IconCash className="h-4 w-4" />
            Withdrawal Requests
          </TabsTrigger>
          <TabsTrigger value="inquiries">
            <IconAlertCircle className="h-4 w-4" />
            Inquiries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <TransactionLogsTab />
        </TabsContent>

        <TabsContent value="withdrawals">
          <WithdrawalRequestsTab />
        </TabsContent>

        <TabsContent value="inquiries">
          <InquiriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
