'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from "next/navigation";
import { trackCheckoutInitiated, trackSubscriptionCancelRequested } from '@/lib/analytics';

import { db } from '@/lib/prisma';

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
        const activeSub = await db.premiumKey.findFirst({
            where: { purchasedBy: session.user.id, status: 'ACTIVE' },
        });

        if (activeSub) {
            return { error: 'You already have an active premium subscription.' };
        }

        const paymentApiUrl =
            process.env.PAYMENT_API_URL || 'http://localhost:8000/api/v1';

        // Strip trailing slash if present for safe path appending
        const baseUrl = paymentApiUrl.endsWith('/')
            ? paymentApiUrl.slice(0, -1)
            : paymentApiUrl;

        // We pass the user id as a string. Pydantic's implicit coercion to `int` will
        // handle this safely on the Python side without Javascript floating-point precision loss.
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

        const response = await fetch(`${baseUrl}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
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

    trackCheckoutInitiated(session.user.id, tierId, priceId);

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
        const paymentApiUrl =
            process.env.PAYMENT_API_URL || 'http://localhost:8000/api/v1';

        const baseUrl = paymentApiUrl.endsWith('/')
            ? paymentApiUrl.slice(0, -1)
            : paymentApiUrl;

        const payload: Record<string, any> = {
            price_id: priceId,
            uid: session.user.id,
            tier: tierId,
            type: giftType,
        };

        if (couponId) {
            payload.coupon_id = couponId;
        }

        const response = await fetch(`${baseUrl}/checkout/gift`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
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

        const paymentApiUrl =
            process.env.PAYMENT_API_URL || 'http://localhost:8000/api/v1';

        const baseUrl = paymentApiUrl.endsWith('/')
            ? paymentApiUrl.slice(0, -1)
            : paymentApiUrl;

        const payload = {
            uid: session.user.id,
        };

        const response = await fetch(`${baseUrl}/gift/${codeId}/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorDetail = 'Failed to claim gift code. Please try again.';
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorDetail;
            } catch {
                try {
                    errorDetail = await response.text() || errorDetail;
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

            return await createCheckoutSession(
                priceId,
                data.tier,
                data.coupon_id
            );
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

        const paymentApiUrl =
            process.env.PAYMENT_API_URL || 'http://localhost:8000/api/v1';
        const baseUrl = paymentApiUrl.endsWith('/')
            ? paymentApiUrl.slice(0, -1)
            : paymentApiUrl;

        const payload = {
            uid: session.user.id,
        };

        const response = await fetch(`${baseUrl}/subscription/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
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

        if (data.status !== 'Success') {
            return {
                error: data.message || 'Invalid response from payment server.',
            };
        }

        trackSubscriptionCancelRequested(session.user.id);

        return { success: true };
    } catch (error) {
        console.error('Error in cancelSubscription:', error);
        return {
            error:
                'An unexpected error occurred while communicating with the server.',
        };
    }
}
