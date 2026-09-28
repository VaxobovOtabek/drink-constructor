import { NextResponse } from 'next/server';
import { sendTelegramTestMessage } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const { botToken, chatId } = await request.json();

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Bot Token va Chat ID talab qilinadi' },
        { status: 400 }
      );
    }

    const result = await sendTelegramTestMessage(botToken, chatId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Telegram test API error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Telegram test xatosi' },
      { status: 500 }
    );
  }
}
