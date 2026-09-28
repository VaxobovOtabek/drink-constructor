import { NextResponse } from 'next/server';
import { Order } from '@/types';
import {
  sendOrderToTelegram,
  editOrderInTelegram,
  updateOrderStatusInTelegram,
} from '@/lib/telegram';
import {
  syncOrderWithGoogleSheets,
  updateOrderStatusInGoogleSheets,
  editOrderInGoogleSheets,
  deleteOrderInGoogleSheets,
  clearAllOrdersInGoogleSheets,
} from '@/lib/excel';

export async function POST(request: Request) {
  try {
    const order: Order = await request.json();

    if (!order || !order.customer || !order.items) {
      return NextResponse.json(
        { error: 'Noto\'g\'ri buyurtma formati' },
        { status: 400 }
      );
    }

    let syncedTelegram = false;
    let telegramMessageId: number | undefined;
    let telegramChatId: string | undefined;
    let syncedExcel = false;

    // Send to Telegram Bot if configured
    try {
      const tgRes = await sendOrderToTelegram(order);
      syncedTelegram = tgRes.success;
      telegramMessageId = tgRes.messageId;
      telegramChatId = tgRes.chatId;
    } catch (tgError) {
      console.error('Telegram dispatch error:', tgError);
    }

    // Sync to Google Sheets if configured
    try {
      const sheetRes = await syncOrderWithGoogleSheets(order);
      syncedExcel = sheetRes.success;
    } catch (sheetError) {
      console.error('Sheets dispatch error:', sheetError);
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderNumber,
      syncedTelegram,
      telegramMessageId,
      telegramChatId,
      syncedExcel,
    });
  } catch (error: any) {
    console.error('API POST /api/orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Serverda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, orderId, status, order } = body;

    const idToUpdate = orderNumber || orderId;

    if (!idToUpdate || !status) {
      return NextResponse.json(
        { error: 'orderNumber va status talab qilinadi' },
        { status: 400 }
      );
    }

    let syncedExcel = false;
    let syncedTelegram = false;

    // Update Telegram message status
    if (order) {
      try {
        const tgRes = await updateOrderStatusInTelegram(order, status);
        syncedTelegram = tgRes.success;
      } catch (tgError) {
        console.error('Telegram status update error:', tgError);
      }
    }

    // Update in Google Sheets
    try {
      const sheetRes = await updateOrderStatusInGoogleSheets(idToUpdate, status);
      syncedExcel = sheetRes.success;
    } catch (sheetError) {
      console.error('Google Sheets status sync error:', sheetError);
    }

    return NextResponse.json({
      success: true,
      orderId: idToUpdate,
      status,
      syncedTelegram,
      syncedExcel,
    });
  } catch (error: any) {
    console.error('API PATCH /api/orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Serverda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const order: Order = await request.json();

    if (!order || !order.orderNumber) {
      return NextResponse.json(
        { error: 'Tahrirlash uchun buyurtma ma\'lumoti talab qilinadi' },
        { status: 400 }
      );
    }

    let syncedExcel = false;
    let syncedTelegram = false;
    let newTelegramMessageId: number | undefined;

    // 1. Edit the message in Telegram Bot
    try {
      const tgRes = await editOrderInTelegram(order);
      syncedTelegram = tgRes.success;
      newTelegramMessageId = tgRes.messageId;
    } catch (tgError) {
      console.error('Telegram edit order error:', tgError);
    }

    // 2. Edit order in Google Sheets
    try {
      const sheetRes = await editOrderInGoogleSheets(order);
      syncedExcel = sheetRes.success;
    } catch (sheetError) {
      console.error('Google Sheets edit order error:', sheetError);
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderNumber,
      syncedTelegram,
      telegramMessageId: newTelegramMessageId || order.telegramMessageId,
      syncedExcel,
    });
  } catch (error: any) {
    console.error('API PUT /api/orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Serverda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber') || searchParams.get('orderId');
    const clearAll = searchParams.get('clearAll') === 'true';

    let syncedExcel = false;

    if (clearAll) {
      const sheetRes = await clearAllOrdersInGoogleSheets();
      syncedExcel = sheetRes.success;
      return NextResponse.json({
        success: true,
        clearedAll: true,
        syncedExcel,
      });
    }

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'O\'chirish uchun orderNumber talab qilinadi' },
        { status: 400 }
      );
    }

    const sheetRes = await deleteOrderInGoogleSheets(orderNumber);
    syncedExcel = sheetRes.success;

    return NextResponse.json({
      success: true,
      deletedOrderId: orderNumber,
      syncedExcel,
    });
  } catch (error: any) {
    console.error('API DELETE /api/orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Serverda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
