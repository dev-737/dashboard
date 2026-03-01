'use server';

import crypto from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

import { db } from '@/lib/prisma';

function getPaymentApiBase(): string {
    const paymentApiUrl =
        process.env.PAYMENT_API_URL || 'http://localhost:8000/api/v1';
    return paymentApiUrl.endsWith('/')
        ? paymentApiUrl.slice(0, -1)
        : paymentApiUrl;
}

function createAuthHeaders(body: string): Record<string, string> {
    const secret = process.env.PAYMENT_API_SECRET;
    if (!secret) {
        console.warn(
            'PAYMENT_API_SECRET is not set — requests to the payment API will not be signed.'
        );
        return { 'Content-Type': 'application/json' };
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${body}`)
        .digest('hex');

    return {
        'Content-Type': 'application/json',
        'Stripe-Signature': `t=${timestamp},v1=${signature}`,
    };
}

export async function createCheckoutSession(
    priceId: string,
    tierId: string,
    couponId?: string
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user.id) {
        redirect(`/login?callbackUrl=/premium`);
    }

    try {
        // Skip active-sub check when redeeming a discount gift (couponId present)
        if (!couponId) {
            const activeSub = await db.premiumKey.findFirst({
                where: { purchasedBy: session.user.id, status: 'ACTIVE' },
            });

            if (activeSub) {
                // Allow re-subscribe if the current subscription is cancelling at period end
                const cancellingSubscription =
                    await db.stripeSubscription.findFirst({
                        where: {
                            id: activeSub.subscriptionId,
                            cancelAtPeriodEnd: true,
                        },
                    });

                if (!cancellingSubscription) {
                    return { error: 'You already have an active premium subscription.' };
                }
            }
        }

        const baseUrl = getPaymentApiBase();

        const payload: Record<string, any> = {
            price_id: priceId,
            quantity: 1,
            mode: 'subscription',
            uid: session.user.id,
            tier: tierId,
        };

        if (couponId) {
            payload.coupon_id = couponId;
        }

        const body = JSON.stringify(payload);
        const response = await fetch(`${baseUrl}/checkout`, {
            method: 'POST',
            headers: createAuthHeaders(body),
            body,
        });

        if (!response.ok) {
            console.error(
                'Failed to create checkout session:',
                await response.text()
            );
            return {
                error: 'Failed to create checkout session. Please try again later.',
            };
        }

        const data = await response.json();

        if (!data.url) {
            return { error: 'Invalid response from payment server.' };
        }

        return { url: data.url };
    } catch (error) {
        console.error('Error in createCheckoutSession:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createGiftCheckoutSession(
    priceId: string,
    tierId: string,
    giftType: 'FREE' | 'DISCOUNT',
    couponId?: string
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user.id) {
        redirect(`/login?callbackUrl=/premium`);
    }

    try {
        const baseUrl = getPaymentApiBase();

        const payload: Record<string, any> = {
            price_id: priceId,
            quantity: 1,
            mode: 'payment',
            uid: session.user.id,
            tier: tierId,
            type: giftType,
        };

        if (couponId) {
            payload.coupon_id = couponId;
        }

        const body = JSON.stringify(payload);
        const response = await fetch(`${baseUrl}/checkout/gift`, {
            method: 'POST',
            headers: createAuthHeaders(body),
            body,
        });

        if (!response.ok) {
            console.error(
                'Failed to create gift checkout session:',
                await response.text()
            );
            return {
                error: 'Failed to create checkout session. Please try again later.',
            };
        }

        const data = await response.json();

        if (!data.url) {
            return { error: 'Invalid response from payment server.' };
        }

        return { url: data.url };
    } catch (error) {
        console.error('Error in createGiftCheckoutSession:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function claimGiftCode(codeId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user.id) {
            return { error: 'You must be logged in to claim a gift code.' };
        }

        // Idempotency: check if this gift code was already claimed locally
        const existingGift = await db.giftCode.findUnique({
            where: { id: codeId },
        });

        if (existingGift?.claimedById) {
            return { error: 'This gift code has already been claimed.' };
        }

        const baseUrl = getPaymentApiBase();

        const payload = {
            uid: session.user.id,
        };

        const body = JSON.stringify(payload);
        const response = await fetch(`${baseUrl}/gift/${codeId}/claim`, {
            method: 'POST',
            headers: createAuthHeaders(body),
            body,
        });

        if (!response.ok) {
            let errorDetail = 'Failed to claim gift code. Please try again.';
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorDetail;
            } catch {
                try {
                    errorDetail = (await response.text()) || errorDetail;
                } catch {
                    // Ignore parsing errors
                }
            }
            return { error: errorDetail };
        }

        const data = await response.json();

        if (data.status === 'DiscountAvailable') {
            const priceMap: Record<string, string> = {
                CORE: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_CORE || 'price_core',
                PLUS: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PLUS || 'price_plus',
                PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || 'price_pro',
            };

            const priceId = priceMap[data.tier];

            if (!priceId) {
                console.error(`No price ID configured for tier: ${data.tier}`);
                return {
                    error: `No pricing configured for tier "${data.tier}". Please contact support.`,
                };
            }

            return await createCheckoutSession(priceId, data.tier, data.coupon_id);
        }

        return { success: true };
    } catch (error) {
        console.error('Error claiming gift:', error);
        return { error: 'An unexpected error occurred while claiming the code.' };
    }
}

export async function cancelSubscription() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user.id) {
            return {
                error: 'You must be logged in to cancel a premium subscription.',
            };
        }

        const activeSub = await db.premiumKey.findFirst({
            where: { purchasedBy: session.user.id, status: 'ACTIVE' },
        });

        if (!activeSub) {
            return { error: 'No active subscription found to cancel.' };
        }

        if (activeSub.subscriptionId.startsWith('gift_')) {
            return { error: 'Gift subscriptions cannot be cancelled manually.' };
        }

        const baseUrl = getPaymentApiBase();

        const payload = {
            uid: session.user.id,
            subscriptionId: activeSub.subscriptionId,
        };

        const body = JSON.stringify(payload);
        const response = await fetch(`${baseUrl}/subscription/cancel`, {
            method: 'POST',
            headers: createAuthHeaders(body),
            body,
        });

        if (!response.ok) {
            if (response.status === 404) {
                return { error: 'No active subscription found to cancel.' };
            }
            console.error('Failed to cancel subscription:', await response.text());
            return {
                error: 'Failed to cancel subscription. Please try again later.',
            };
        }

        const data = await response.json();

        if (data.status?.toLowerCase() !== 'success') {
            return {
                error: data.message || 'Invalid response from payment server.',
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in cancelSubscription:', error);
        return {
            error:
                'An unexpected error occurred while communicating with the server.',
        };
    }
}

export type GiftCodeStatus =
    | { status: 'valid'; tier: string; isFree: boolean }
    | { status: 'claimed' }
    | { status: 'expired' }
    | { status: 'not_found' };

export async function getGiftCodeStatus(
    codeId: string
): Promise<GiftCodeStatus> {
    try {
        const giftCode = await db.giftCode.findUnique({
            where: { id: codeId },
            select: {
                tier: true,
                isFree: true,
                claimedById: true,
                claimedAt: true,
                expiresAt: true,
            },
        });

        if (!giftCode) {
            return { status: 'not_found' };
        }

        if (giftCode.claimedById || giftCode.claimedAt) {
            return { status: 'claimed' };
        }

        if (giftCode.expiresAt && giftCode.expiresAt < new Date()) {
            return { status: 'expired' };
        }

        return {
            status: 'valid',
            tier: giftCode.tier,
            isFree: giftCode.isFree,
        };
    } catch (error) {
        console.error('Error checking gift code status:', error);
        return { status: 'not_found' };
    }
}
