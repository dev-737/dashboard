"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";

export async function createCheckoutSession(priceId: string, tierId: string, couponId?: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user.id) {
        redirect(`/login?callbackUrl=/premium`);
    }

    try {
        const activeSub = await db.premiumKey.findFirst({
            where: { purchasedBy: session.user.id, status: 'ACTIVE' },
        });

        if (activeSub) {
            return { error: "You already have an active premium subscription." };
        }

        const paymentApiUrl =
            process.env.PAYMENT_API_URL || "http://localhost:8000/api/v1";

        // Strip trailing slash if present for safe path appending
        const baseUrl = paymentApiUrl.endsWith("/")
            ? paymentApiUrl.slice(0, -1)
            : paymentApiUrl;

        // We pass the user id as a string. Pydantic's implicit coercion to `int` will
        // handle this safely on the Python side without Javascript floating-point precision loss.
        const payload: Record<string, any> = {
            price_id: priceId,
            quantity: 1,
            mode: "subscription",
            uid: session.user.id,
            tier: tierId,
        };

        if (couponId) {
            payload.coupon_id = couponId;
        }

        const response = await fetch(`${baseUrl}/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(
                "Failed to create checkout session:",
                await response.text(),
            );
            return {
                error: "Failed to create checkout session. Please try again later.",
            };
        }

        const data = await response.json();

        if (!data.url) {
            return { error: "Invalid response from payment server." };
        }

        return { url: data.url };
    } catch (error) {
        console.error("Error in createCheckoutSession:", error);
        return { error: "An unexpected error occurred. Please try again." };
    }
}

export async function claimGiftCode(codeId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user.id) {
            return { error: "You must be logged in to claim a gift code." };
        }

        // We fetch the code using Prisma
        const gift = await db.giftCode.findUnique({
            where: { code: codeId },
        });

        if (!gift) {
            return { error: "This gift code does not exist or has been deleted." };
        }

        if (gift.claimedById) {
            return { error: "This gift code has already been claimed." };
        }

        if (gift.expiresAt && gift.expiresAt < new Date()) {
            return { error: "This gift code has expired." };
        }

        const activeSub = await db.premiumKey.findFirst({
            where: { purchasedBy: session.user.id, status: 'ACTIVE' },
        });

        if (activeSub) {
            return { error: "You already have an active premium subscription." };
        }

        if (gift.isFree) {
            // Full free gift: Process immediately manually without Stripe
            const dummySubscriptionId = `gift_${gift.id}`;

            await db.$transaction(async (tx) => {
                await tx.giftCode.update({
                    where: { id: gift.id },
                    data: {
                        claimedById: session.user.id,
                        claimedAt: new Date(),
                    }
                });

                const endDate = new Date();
                if (gift.durationMonths) {
                    endDate.setMonth(endDate.getMonth() + gift.durationMonths);
                } else {
                    // Default to 1 year if not specified
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }

                await tx.stripeSubscription.create({
                    data: {
                        id: dummySubscriptionId,
                        customerId: "free_gift",
                        tier: gift.tier,
                        currentPeriodEnd: endDate,
                        cancelAtPeriodEnd: true,
                        status: "ACTIVE",
                    }
                });

                await tx.premiumKey.create({
                    data: {
                        purchasedBy: session.user.id,
                        subscriptionId: dummySubscriptionId,
                        tier: gift.tier,
                    }
                });
            });

            return { success: true };
        } else {
            // Discounted gift code: we redirect to checkout using the coupon

            // Mark it as claimed immediately to avoid reuse (though they haven't paid yet, might cause orphaned codes)
            // Ideally we claim it AFTER payment but for simplicity we claim it now since the coupon works.
            await db.giftCode.update({
                where: { id: gift.id },
                data: {
                    claimedById: session.user.id,
                    claimedAt: new Date(),
                }
            });

            // Need to know what priceId to use for checkout. We derive from environment mapping
            // since we don't store price string locally, just tier.
            const priceMap: Record<string, string> = {
                CORE: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_CORE || "price_core",
                PLUS: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PLUS || "price_plus",
                PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || "price_pro",
            };

            const priceId = priceMap[gift.tier];

            return await createCheckoutSession(priceId, gift.tier, gift.stripeCouponId ?? undefined);
        }

    } catch (error) {
        console.error("Error in claimGiftCode:", error);
        return { error: "An unexpected error occurred while claiming the code." };
    }
}

export async function cancelSubscription() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user.id) {
            return {
                error: "You must be logged in to cancel a premium subscription.",
            };
        }

        const activeSub = await db.premiumKey.findFirst({
            where: { purchasedBy: session.user.id, status: 'ACTIVE' },
        });

        if (!activeSub) {
            return { error: "No active subscription found to cancel." };
        }

        if (activeSub.subscriptionId.startsWith("gift_")) {
            return { error: "Gift subscriptions cannot be cancelled manually." };
        }

        const paymentApiUrl =
            process.env.PAYMENT_API_URL || "http://localhost:8000/api/v1";
        const baseUrl = paymentApiUrl.endsWith("/")
            ? paymentApiUrl.slice(0, -1)
            : paymentApiUrl;

        const payload = {
            uid: session.user.id,
        };

        const response = await fetch(`${baseUrl}/subscription/cancel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            if (response.status === 404) {
                return { error: "No active subscription found to cancel." };
            }
            console.error(
                "Failed to cancel subscription:",
                await response.text(),
            );
            return {
                error: "Failed to cancel subscription. Please try again later.",
            };
        }

        const data = await response.json();

        if (data.status !== "Success") {
            return {
                error: data.message || "Invalid response from payment server.",
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in cancelSubscription:", error);
        return {
            error: "An unexpected error occurred while communicating with the server.",
        };
    }
}
