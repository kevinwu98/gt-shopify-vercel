import { T } from "gt-next";
import { getLocale } from "gt-next/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { OrderDate, OrderStatusBadge, OrderStatusLabel } from "@/components/account/order-display";
import { AccountPageHeader } from "@/components/account/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCatalogText } from "@/lib/catalog/server";
import type { OrderLineItem } from "@/lib/customer/types";
import { formatPrice } from "@/lib/money";
import type { Money } from "@/lib/money/types";
import { fetchCustomerOrder } from "@/lib/shopify/operations/customer/server";
import { PLACEHOLDER_HANDLE } from "@/lib/static-params";

// gt-next's client provider reads usePathname(), so this route needs a known param to prerender its shell.
export function generateStaticParams() {
  return [{ id: PLACEHOLDER_HANDLE }];
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}

async function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) notFound();
  const [order, locale, ct] = await Promise.all([
    fetchCustomerOrder(id),
    getLocale(),
    getCatalogText(),
  ]);
  if (!order) notFound();
  return (
    <>
      <AccountPageHeader title={order.name} description={<OrderDate iso={order.processedAt} />} />

      <div className="flex flex-wrap items-center gap-2">
        <OrderStatusBadge status={order.fulfillmentStatus} />
        {order.financialStatus ? (
          <Badge variant="outline">
            <OrderStatusLabel status={order.financialStatus} />
          </Badge>
        ) : null}
      </div>

      <ul className="grid divide-y rounded-lg border">
        {order.lineItems.map((item, index) => (
          <OrderLineItemRow
            key={index}
            item={{
              ...item,
              title: ct(item.title),
              variantTitle: item.variantTitle && item.variantTitle.split(" / ").map(ct).join(" / "),
            }}
            locale={locale}
          />
        ))}
      </ul>

      <dl className="grid gap-2 rounded-lg border p-4 text-sm">
        <SummaryRow label={<T>Subtotal</T>} locale={locale} money={order.subtotal} />
        <SummaryRow label={<T>Shipping</T>} locale={locale} money={order.totalShipping} />
        <SummaryRow label={<T>Tax</T>} locale={locale} money={order.totalTax} />
        <div className="flex items-center justify-between border-t pt-2 font-medium">
          <T>
            <dt>Total</dt>
          </T>
          <dd className="font-mono tabular-nums">{formatPrice(order.totalPrice, locale)}</dd>
        </div>
      </dl>

      {order.shippingAddress && order.shippingAddress.formatted.length > 0 ? (
        <div className="grid gap-2 rounded-lg border p-4">
          <T>
            <h2 className="text-sm font-medium">Shipping address</h2>
          </T>
          <address className="text-sm text-muted-foreground not-italic">
            {order.shippingAddress.formatted.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          render={<a href={order.statusPageUrl} target="_blank" rel="noopener noreferrer" />}
        >
          <T>View order status</T>
        </Button>
      </div>
    </>
  );
}

function OrderLineItemRow({ item, locale }: { item: OrderLineItem; locale: string }) {
  return (
    <li className="flex items-center gap-3 p-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.image ? (
          <Image
            src={item.image.url}
            alt={item.image.altText}
            fill
            className="object-cover"
            sizes="100vw"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        {item.variantTitle ? (
          <p className="truncate text-xs text-muted-foreground">{item.variantTitle}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">× {item.quantity}</p>
      </div>
      {item.totalPrice ? (
        <span className="font-mono text-sm tabular-nums">
          {formatPrice(item.totalPrice, locale)}
        </span>
      ) : null}
    </li>
  );
}

function SummaryRow({
  label,
  locale,
  money,
}: {
  label: ReactNode;
  locale: string;
  money: Money | null;
}) {
  if (!money) return null;
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono tabular-nums">{formatPrice(money, locale)}</dd>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}
