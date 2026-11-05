import { T } from "gt-next";
import { getGT } from "gt-next/server";
import { Suspense } from "react";

import { AccountPageHeader } from "@/components/account/page-header";
import { ProfileForm } from "@/components/account/profile-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getCustomerProfile } from "@/lib/shopify/operations/customer/server";

export default function ProfilePage() {
  return (
    <>
      <AccountPageHeader title={<T>Profile</T>} description={<T>Your account information</T>} />
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </>
  );
}

async function ProfileContent() {
  const gt = await getGT();
  const profile = await getCustomerProfile();
  if (!profile) return null;
  return (
    <ProfileForm
      labels={{
        email: gt("Email"),
        firstName: gt("First name"),
        lastName: gt("Last name"),
        profileUpdated: gt("Profile updated"),
        save: gt("Save"),
      }}
      profile={profile}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid max-w-md gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="grid gap-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-full" />
      </div>
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  );
}
