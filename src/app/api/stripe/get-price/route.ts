import getStripe from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const priceId = process.env.STRIPE_PRO_PRICE_ID;
        if (!priceId) {
            return NextResponse.json(
                { error: "Price not configured" },
                { status: 500 }
            );
        }

        const price = await getStripe().prices.retrieve(priceId);

        if (!price.unit_amount || !price.currency) {
            return NextResponse.json(
                { error: "Invalid price data" },
                { status: 500 }
            );
        }

        const formatted = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: price.currency,
        }).format(price.unit_amount / 100);

        return NextResponse.json({
            formatted,
            interval: price.recurring?.interval ?? "month",
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch price" },
            { status: 500 }
        );
    }
}
