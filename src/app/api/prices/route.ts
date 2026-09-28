import { NextResponse } from 'next/server';
import { syncPricesWithGoogleSheets, fetchPricesFromGoogleSheets } from '@/lib/excel';
import { BOTTLE_SIZES } from '@/data/bottleSizes';
import { FLAVORS_DATA } from '@/data/flavors';
import { ADDITIVES_DATA } from '@/data/additives';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sheetRes = await fetchPricesFromGoogleSheets();

    if (sheetRes.success && sheetRes.data) {
      return NextResponse.json({
        success: true,
        source: 'google_sheets',
        sizes: sheetRes.data.sizes || [],
        flavors: sheetRes.data.flavors || [],
        additives: sheetRes.data.additives || [],
      });
    }

    // Fallback to local default data
    return NextResponse.json({
      success: true,
      source: 'default',
      sizes: BOTTLE_SIZES,
      flavors: FLAVORS_DATA,
      additives: ADDITIVES_DATA,
    });
  } catch (error: any) {
    console.error('API GET /api/prices error:', error);
    return NextResponse.json(
      {
        success: true,
        source: 'fallback',
        sizes: BOTTLE_SIZES,
        flavors: FLAVORS_DATA,
        additives: ADDITIVES_DATA,
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sizes, flavors, additives } = body;

    if (!sizes || !flavors || !additives) {
      return NextResponse.json(
        { error: 'sizes, flavors va additives talab qilinadi' },
        { status: 400 }
      );
    }

    let syncedExcel = false;
    let excelError: string | undefined;

    try {
      const sheetRes = await syncPricesWithGoogleSheets({ sizes, flavors, additives });
      syncedExcel = sheetRes.success;
      excelError = sheetRes.error;
    } catch (e: any) {
      console.error('Google Sheets sync prices error in API:', e);
      excelError = e.message;
    }

    return NextResponse.json({
      success: true,
      syncedExcel,
      excelError,
    });
  } catch (error: any) {
    console.error('API POST /api/prices error:', error);
    return NextResponse.json(
      { error: error.message || 'Serverda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
