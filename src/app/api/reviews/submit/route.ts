import { NextRequest, NextResponse } from 'next/server';
import { submitReview, SubmitReviewInput } from '@/lib/services/reviews';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input: SubmitReviewInput = {
      placeId: body.placeId,
      reviewerAddress: body.reviewerAddress,
      verificationTier: Number(body.verificationTier) as 1 | 2,
      rating: Number(body.rating),
      reviewText: body.reviewText || '',
      userLatitude: Number(body.userLatitude),
      userLongitude: Number(body.userLongitude),
      foodPhoto: body.foodPhoto,
      receiptSlip: body.receiptSlip,
      customSlipRef: body.customSlipRef,
      customAmountThb: body.customAmountThb ? Number(body.customAmountThb) : undefined,
      qrNonce: body.qrNonce,
    };

    const result = await submitReview(input);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Verified review submitted successfully! Earned ${result.rewards.totalTaste} $TASTE${
        result.rewards.bountyAvax > 0 ? ` + ${result.rewards.bountyAvax} AVAX` : ''
      }${result.isPioneer ? ' (🔥 2x Pioneer Bonus Awarded!)' : ''}`,
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit verified review',
      },
      { status: 400 }
    );
  }
}
