import { Order } from '@/types';

function getStatusBadge(status: Order['status']): string {
  switch (status) {
    case 'new': return '🟡 Yangi';
    case 'preparing': return '👨‍🍳 Tayyorlanmoqda';
    case 'delivering': return '🛵 Yetkazilmoqda';
    case 'completed': return '✅ Yakunlandi (Topshirildi)';
    case 'cancelled': return '❌ Bekor qilindi';
    default: return status;
  }
}

export function formatOrderTelegramMessage(order: Order, isEdited = false): string {
  const headerIcon = isEdited ? '✏️' : '🍹';
  const headerTitle = isEdited ? 'TAHRIRLANGAN BUYURTMA' : 'YANGI BUYURTMA';
  
  let message = `${headerIcon} <b>${headerTitle} #${order.orderNumber}</b>\n`;
  if (isEdited) {
    message += `<i>Oxirgi tahrirlangan vaqt: ${new Date().toLocaleString('uz-UZ')}</i>\n`;
  }
  message += `\n`;

  const cleanPhone = String(order.customer.phone).replace(/\D/g, '').slice(-9) || order.customer.phone;
  message += `👤 <b>Mijoz:</b> ${escapeHtml(order.customer.name)}\n`;
  message += `📞 <b>Telefon:</b> +998 ${cleanPhone} (<a href="tel:+998${cleanPhone}">Qo'ng'iroq qilish</a>)\n`;
  message += `📍 <b>Manzil:</b> ${escapeHtml(order.customer.address)}\n`;
  if (order.customer.notes) {
    message += `📝 <b>Izoh:</b> ${escapeHtml(order.customer.notes)}\n`;
  }
  message += `💳 <b>To'lov turi:</b> ${order.customer.paymentMethod.toUpperCase()}\n`;
  message += `🕒 <b>Yaratilgan vaqt:</b> ${new Date(order.createdAt).toLocaleString('uz-UZ')}\n\n`;

  message += `🧪 <b>ICHIMLIK RESEPTI VA TARKIBI:</b>\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;

  order.items.forEach((item, idx) => {
    const drink = item.drink;
    message += `<b>${idx + 1}. ${escapeHtml(drink.drinkName)}</b> (${drink.bottleSize.label})\n`;
    message += `   🔢 Miqdor: <b>${item.quantity} dona</b>\n`;
    message += `   ✨ <b>Ta'mlar proporsiyasi:</b>\n`;

    drink.flavors.forEach((f) => {
      message += `     • ${f.flavor.icon} ${escapeHtml(f.flavor.nameUz)}: <b>${f.amountMg} mg</b>\n`;
    });

    message += `   🫧 Gazlilik: <b>${getCarbonationText(drink.carbonation)}</b>\n`;
    message += `   ❄️ Muz miqdori: <b>${drink.iceLevel}%</b>\n`;
    message += `   🍯 Shirinlik: <b>${drink.sweetnessLevel}% (${getSweetenerText(drink.sweetenerType)})</b>\n`;

    if (drink.additives.length > 0) {
      message += `   🌱 Qo'shimchalar: ${drink.additives.map((a) => `${a.icon} ${escapeHtml(a.nameUz)}`).join(', ')}\n`;
    }

    message += `   💰 Birlik narxi: <b>${drink.totalPrice.toLocaleString()} so'm</b>\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💵 <b>JAMI SUMMA: ${order.totalAmount.toLocaleString()} SO'M</b>\n`;
  message += `📊 <b>Status:</b> ${getStatusBadge(order.status)}`;

  return message;
}

export async function sendOrderToTelegram(
  order: Order,
  botToken?: string,
  chatId?: string
): Promise<{ success: boolean; messageId?: number; chatId?: string; error?: string }> {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    console.log('Telegram Token or Chat ID not configured. Skipping telegram send.');
    return { success: false, error: 'Telegram sozlamalari (Token/Chat ID) kiritilmagan' };
  }

  const message = formatOrderTelegramMessage(order, false);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API error:', data);
      return { success: false, error: data.description || 'Telegram yuborishda xatolik yuz berdi' };
    }

    return {
      success: true,
      messageId: data.result?.message_id,
      chatId: String(data.result?.chat?.id || chat),
    };
  } catch (error: any) {
    console.error('Telegram send exception:', error);
    return { success: false, error: error.message || 'Tarmoq xatosi' };
  }
}

export async function editOrderInTelegram(
  order: Order,
  botToken?: string,
  chatId?: string
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = order.telegramChatId || chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return { success: false, error: 'Telegram sozlamalari mavjud emas' };
  }

  const message = formatOrderTelegramMessage(order, true);

  // If we have an existing telegram message ID, edit the existing message
  if (order.telegramMessageId) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat,
          message_id: order.telegramMessageId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      if (data.ok) {
        return { success: true, messageId: order.telegramMessageId };
      }

      // If message wasn't modified (same content), consider it success
      if (data.description && data.description.includes('message is not modified')) {
        return { success: true, messageId: order.telegramMessageId };
      }

      console.warn('editMessageText failed, falling back to sending new message:', data.description);
    } catch (e) {
      console.error('Telegram editMessageText exception:', e);
    }
  }

  // Fallback: send as updated message if messageId wasn't found or edit failed
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      return { success: false, error: data.description || 'Telegram xabari yangilanmadi' };
    }

    return {
      success: true,
      messageId: data.result?.message_id,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateOrderStatusInTelegram(
  order: Order,
  newStatus: Order['status'],
  botToken?: string,
  chatId?: string
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const updatedOrder = { ...order, status: newStatus };
  return editOrderInTelegram(updatedOrder, botToken, chatId);
}

export async function sendTelegramTestMessage(botToken: string, chatId: string) {
  const text = `✅ <b>Drink Constructor Telegram Test!</b>\n\nTelegram bot muvaffaqiyatli ulandi! Endi barcha yangi ichimlik buyurtmalari to'g'ridan-to'g'ri ushbu chatga keladi.\n🕒 Vaqt: ${new Date().toLocaleString('uz-UZ')}`;
  
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });

  return await response.json();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getCarbonationText(val: string): string {
  switch (val) {
    case 'none': return 'Gazsiz';
    case 'low': return 'Kam gazli';
    case 'medium': return 'O\'rtacha gazli';
    case 'high': return 'Kuchli gazli';
    default: return val;
  }
}

function getSweetenerText(val: string): string {
  switch (val) {
    case 'sugar': return 'Tabiiy shakar';
    case 'stevia': return 'Stevia (0 kkal)';
    case 'honey': return 'Tabiiy asal';
    case 'none': return 'Shakarsiz';
    default: return val;
  }
}

