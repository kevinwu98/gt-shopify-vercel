import { T } from "gt-next";
import { Suspense } from "react";

import { AddressBook } from "@/components/account/address-book";
import { AccountPageHeader } from "@/components/account/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCustomerAddresses } from "@/lib/shopify/operations/customer/server";

export default function AddressesPage() {
  return (
    <>
      <AccountPageHeader
        title={<T>Addresses</T>}
        description={<T>Manage your saved addresses</T>}
      />
      <Suspense fallback={<AddressesSkeleton />}>
        <AddressesContent />
      </Suspense>
    </>
  );
}

async function AddressesContent() {
  const addresses = await fetchCustomerAddresses();
  return <AddressBook addresses={addresses} />;
}

function AddressesSkeleton() {
  return (
    <div className="grid gap-3">
      <Skeleton className="h-9 w-32 rounded-lg" />
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-28 w-full rounded-lg" />
    </div>
  );
}
