import { DateTime, msg, useMessages } from "gt-next";

import { Badge } from "@/components/ui/badge";

// Customer Account API order fulfillment and financial statuses.
const STATUS_LABELS: Record<string, string> = {
  AUTHORIZED: msg("Authorized"),
  EXPIRED: msg("Expired"),
  FULFILLED: msg("Fulfilled"),
  IN_PROGRESS: msg("In Progress"),
  ON_HOLD: msg("On Hold"),
  OPEN: msg("Open"),
  PAID: msg("Paid"),
  PARTIALLY_FULFILLED: msg("Partially Fulfilled"),
  PARTIALLY_PAID: msg("Partially Paid"),
  PARTIALLY_REFUNDED: msg("Partially Refunded"),
  PENDING: msg("Pending"),
  PENDING_FULFILLMENT: msg("Pending Fulfillment"),
  REFUNDED: msg("Refunded"),
  RESTOCKED: msg("Restocked"),
  SCHEDULED: msg("Scheduled"),
  UNFULFILLED: msg("Unfulfilled"),
  VOIDED: msg("Voided"),
};

export function humanizeStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function OrderStatusLabel({ status }: { status: string }) {
  const m = useMessages();
  const label = STATUS_LABELS[status];
  return label ? m(label) : humanizeStatus(status);
}

export function OrderDate({ iso }: { iso: string }) {
  return <DateTime options={{ dateStyle: "medium" }}>{new Date(iso)}</DateTime>;
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "FULFILLED" ? "default" : "secondary"}>
      <OrderStatusLabel status={status} />
    </Badge>
  );
}
