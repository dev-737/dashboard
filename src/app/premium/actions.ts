'use server';

import { auth } from '@/lib/auth';
import { trackCheckoutInitiated, trackSubscriptionCancelRequested } from '@/lib/analytics';
import { headers } from 'next/headers';

export async function createCheckoutSession(priceId: string, tierId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { error: 'You must be logged in to purchase a premium subscription.' };
        }

        const paymentApiUrl = process.env.PAYMENT_API_URL || 'http://localhost:8000/api/v1';

        // Strip trailing slash if present for safe path appending
        const baseUrl = paymentApiUrl.endsWith('/') ? paymentApiUrl.slice(0, -1) : paymentApiUrl;

        // We pass the user id as a string. Pydantic's implicit coercion to `int` will
        // handle this safely on the Python side without Javascript floating-point precision loss.
        const payload = {
            price_id: priceId,
            quantity: 1,
            mode: 'subscription',
            uid: session.user.id,
            tier: tierId,
        };

        const response = await fetch(`${baseUrl}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('Failed to create checkout session:', await response.text());
            return { error: 'Failed to create checkout session. Please try again later.' };
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

export async function cancelSubscription() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { error: 'You must be logged in to cancel a premium subscription.' };
        }

        const paymentApiUrl = process.env.PAYMENT_API_URL || 'http://localhost:8000/api/v1';
        const baseUrl = paymentApiUrl.endsWith('/') ? paymentApiUrl.slice(0, -1) : paymentApiUrl;

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
            return { error: 'Failed to cancel subscription. Please try again later.' };
        }

        const data = await response.json();

        if (data.status !== 'Success') {
            return { error: data.message || 'Invalid response from payment server.' };
        }

        trackSubscriptionCancelRequested(session.user.id);

        return { success: true };
    } catch (error) {
        console.error('Error in cancelSubscription:', error);
        return { error: 'An unexpected error occurred while communicating with the server.' };
    }
}
