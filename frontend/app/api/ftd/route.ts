import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract required fields for FTD postback
    const {
      affiliate_id,
      url_id,
      sub1, // aff_click_id
      deposit_amount
    } = body;

    // Basic validation
    if (!affiliate_id || !deposit_amount) {
      return NextResponse.json(
        { success: false, message: 'Affiliate ID and deposit amount are required' },
        { status: 400 }
      );
    }

    let ftdPosted = false;
    let errorMessage = '';

    try {
      // Build query parameters for Hooplaseft FTD postback
      const params = new URLSearchParams({
        affiliate_id: affiliate_id.toString(),
        url_id: url_id || '2',
        deposit_amount: deposit_amount.toString()
      });

      // Add optional sub1 (click ID)
      if (sub1) params.append('sub1', sub1);

      // Construct Hooplaseft API URL for FTD
      const hooplaseftUrl = `https://hooplaseft.com/api/v3/offer/2?${params.toString()}`;

      // Make GET request to Hooplaseft for FTD postback
      const response = await fetch(hooplaseftUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Next.js FTD Postback API',
        },
      });

      // Check if request was successful
      if (response.ok) {
        ftdPosted = true;
      } else {
        errorMessage = `Hooplaseft FTD API error: ${response.status} ${response.statusText}`;
        console.error('Hooplaseft FTD API error:', response.status, response.statusText);
      }
    } catch (error) {
      errorMessage = 'Failed to connect to Hooplaseft FTD API';
      console.error('Hooplaseft FTD API request failed:', error);
    }

    // Return success/error response
    if (ftdPosted) {
      // Build redirect URL for affiliate to access the offer/dashboard
      const redirectUrl = `https://hooplaseft.com/api/v3/offer/2?affiliate_id=${affiliate_id}&url_id=${url_id || '2'}`;

      return NextResponse.json({
        success: true,
        message: 'FTD postback sent successfully to Hooplaseft',
        redirectUrl, // Include redirect URL for frontend to redirect affiliate
        data: {
          ftdPosted: true,
          affiliateId: affiliate_id,
          commission: deposit_amount * 0.3 // 30% commission estimate
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: errorMessage || 'FTD postback failed',
        data: {
          ftdPosted: false
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('FTD API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

