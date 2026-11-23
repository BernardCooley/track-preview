import Stripe from "stripe";

declare global {
    namespace NodeJS {
        interface Global {
            stripe: Stripe;
        }
    }
}

let stripe: Stripe | undefined;

if (typeof window === "undefined") {
    if (process.env.NODE_ENV === "production") {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    } else {
        let globalWithStripe = global as typeof globalThis & {
            stripe: Stripe;
        };
        if (!globalWithStripe.stripe) {
            globalWithStripe.stripe = new Stripe(
                process.env.STRIPE_SECRET_KEY!
            );
        }
        stripe = globalWithStripe.stripe;
    }
}

export default stripe;
