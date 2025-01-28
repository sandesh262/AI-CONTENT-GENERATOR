// app/api/billing/upgrade/route.ts
import { db } from '@/utils/db';
import { AiOutput } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const {
            userId,
            email,
            planName,
            credits,
            transactionId,
            amount
        } = await req.json();

        // Update user's credits in the database
        await db.update(AiOutput)
            .set({
                credits: credits,
                plan: planName,
                lastPaymentDate: new Date(),
            })
            .where(eq(AiOutput.createdBy, email));

        return NextResponse.json({ 
            success: true, 
            message: 'Plan upgraded successfully' 
        });

    } catch (error) {
        console.error('Upgrade error:', error);
        return NextResponse.json(
            { success: false, message: 'Error upgrading plan' },
            { status: 500 }
        );
    }
}