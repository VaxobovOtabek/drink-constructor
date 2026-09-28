import * as XLSX from 'xlsx';
import { Order, BottleSize, Flavor, Additive } from '@/types';

export function exportOrdersToExcel(orders: Order[], filename = 'drink_orders.xlsx') {
  const rows = orders.flatMap((order) => {
    return order.items.map((item, idx) => {
      const drink = item.drink;
      const flavorsList = drink.flavors
        .map((f) => `${f.flavor.nameUz}: ${f.amountMg}mg`)
        .join(', ');
      
      const additivesList = drink.additives
        .map((a) => a.nameUz)
        .join(', ') || 'Yo\'q';

      // Clean 9-digit phone format: e.g. 979053031
      const cleanPhone = String(order.customer.phone).replace(/\D/g, '').slice(-9) || String(order.customer.phone);

      return {
        'Buyurtma ID': order.orderNumber,
        'Sana va Vaqt': new Date(order.createdAt).toLocaleString('uz-UZ'),
        'Mijoz Ismi': order.customer.name,
        'Telefon': cleanPhone,
        'Manzil': order.customer.address,
        'Izoh': order.customer.notes || '-',
        'To\'lov turi': order.customer.paymentMethod.toUpperCase(),
        'Holat': getStatusUz(order.status),
        'Mahsulot raqami': `${idx + 1}/${order.items.length}`,
        'Ichimlik Nomi': drink.drinkName,
        'Idish Hajmi': drink.bottleSize.label,
        'Miqdori (dona)': item.quantity,
        'Ta\'mlar va Dozalar': flavorsList,
        'Jami Ta\'m (mg)': drink.totalFlavorMg,
        'Gazlilik': drink.carbonation,
        'Muz (%)': `${drink.iceLevel}%`,
        'Shirinlik (%)': `${drink.sweetnessLevel}% (${drink.sweetenerType})`,
        'Qo\'shimchalar': additivesList,
        'Kaloriya (kkal)': drink.totalCalories,
        'Dona Narxi (so\'m)': drink.totalPrice,
        'Jami Summa (so\'m)': order.totalAmount,
      };
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set auto column width
  const columnWidths = [
    { wch: 14 }, // Buyurtma ID
    { wch: 18 }, // Sana
    { wch: 18 }, // Mijoz
    { wch: 15 }, // Telefon
    { wch: 25 }, // Manzil
    { wch: 15 }, // Izoh
    { wch: 12 }, // To'lov turi
    { wch: 14 }, // Holat
    { wch: 12 }, // Mahsulot raqami
    { wch: 20 }, // Nomi
    { wch: 12 }, // Hajmi
    { wch: 12 }, // Miqdor
    { wch: 35 }, // Ta'mlar
    { wch: 14 }, // Ta'm mg
    { wch: 12 }, // Gazlilik
    { wch: 10 }, // Muz
    { wch: 18 }, // Shirinlik
    { wch: 25 }, // Qo'shimchalar
    { wch: 14 }, // Kaloriya
    { wch: 16 }, // Dona narxi
    { wch: 18 }, // Jami summa
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Buyurtmalar');

  XLSX.writeFile(workbook, filename);
}

export async function syncOrderWithGoogleSheets(order: Order, webhookUrl?: string): Promise<{ success: boolean; error?: string }> {
  const url = webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) {
    return { success: false, error: 'Google Sheets Webhook URL sozlanmagan' };
  }

  const cleanPhone = String(order.customer.phone).replace(/\D/g, '').slice(-9) || String(order.customer.phone);

  try {
    const payload = {
      action: 'create_order',
      orderId: order.orderNumber,
      createdAt: new Date(order.createdAt).toLocaleString('uz-UZ'),
      customerName: order.customer.name,
      customerPhone: cleanPhone,
      customerAddress: order.customer.address,
      notes: order.customer.notes || '',
      paymentMethod: order.customer.paymentMethod,
      status: getStatusUz(order.status),
      totalAmount: order.totalAmount,
      items: order.items.map((i) => ({
        drinkName: i.drink.drinkName,
        size: i.drink.bottleSize.label,
        quantity: i.quantity,
        flavors: i.drink.flavors.map((f) => `${f.flavor.nameUz} (${f.amountMg}mg)`).join(', '),
        carbonation: i.drink.carbonation,
        ice: i.drink.iceLevel,
        sweetness: `${i.drink.sweetnessLevel}% ${i.drink.sweetenerType}`,
        additives: i.drink.additives.map((a) => a.nameUz).join(', '),
        price: i.drink.totalPrice,
      })),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Google Sheets xatosi: ${response.statusText}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Google Sheets sync error:', error);
    return { success: false, error: error.message || 'Sheets sinxronlashda xatolik' };
  }
}

export async function updateOrderStatusInGoogleSheets(
  orderNumber: string,
  status: Order['status'],
  webhookUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const url = webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) {
    return { success: false, error: 'Google Sheets Webhook URL sozlanmagan' };
  }

  try {
    const cleanId = String(orderNumber).replace(/^#/, '').trim();
    const statusUz = getStatusUz(status);

    const payload = {
      action: 'update_status',
      orderId: cleanId,
      status: statusUz,
      items: [],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Google Sheets xatosi: ${response.statusText}` };
    }

    const resJson = await response.json().catch(() => ({}));
    return { success: true, ...resJson };
  } catch (error: any) {
    console.error('Google Sheets status update error:', error);
    return { success: false, error: error.message || 'Status yangilashda xatolik' };
  }
}

export async function editOrderInGoogleSheets(
  order: Order,
  webhookUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const url = webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) {
    return { success: false, error: 'Google Sheets Webhook URL sozlanmagan' };
  }

  try {
    const cleanPhone = String(order.customer.phone).replace(/\D/g, '').slice(-9) || String(order.customer.phone);
    const cleanId = String(order.orderNumber).replace(/^#/, '').trim();

    const payload = {
      action: 'edit_order',
      orderId: cleanId,
      customerName: order.customer.name,
      customerPhone: cleanPhone,
      customerAddress: order.customer.address,
      notes: order.customer.notes || '',
      paymentMethod: order.customer.paymentMethod,
      status: getStatusUz(order.status),
      totalAmount: order.totalAmount,
      items: order.items.map((i) => ({
        drinkName: i.drink.drinkName,
        size: i.drink.bottleSize.label,
        quantity: i.quantity,
        flavors: i.drink.flavors.map((f) => `${f.flavor.nameUz} (${f.amountMg}mg)`).join(', '),
      })),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Google Sheets xatosi: ${response.statusText}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Google Sheets edit order error:', error);
    return { success: false, error: error.message || 'Buyurtmani tahrirlashda xatolik' };
  }
}

export async function deleteOrderInGoogleSheets(
  orderNumber: string,
  webhookUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const url = webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) {
    return { success: false, error: 'Google Sheets Webhook URL sozlanmagan' };
  }

  try {
    const cleanId = String(orderNumber).replace(/^#/, '').trim();

    const payload = {
      action: 'delete_order',
      orderId: cleanId,
      items: [],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Google Sheets xatosi: ${response.statusText}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Google Sheets delete order error:', error);
    return { success: false, error: error.message || 'Buyurtmani o\'chirishda xatolik' };
  }
}

export async function clearAllOrdersInGoogleSheets(
  webhookUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const url = webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) {
    return { success: false, error: 'Google Sheets Webhook URL sozlanmagan' };
  }

  try {
    const payload = {
      action: 'clear_all_orders',
      items: [],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Google Sheets xatosi: ${response.statusText}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Google Sheets clear all orders error:', error);
    return { success: false, error: error.message || 'Barchasini tozalashda xatolik' };
  }
}

export function getStatusUz(status: string): string {
  switch (status) {
    case 'new': return 'Yangi';
    case 'preparing': return 'Tayyorlanmoqda';
    case 'delivering': return 'Yetkazilmoqda';
    case 'completed': return 'Yakunlandi';
    case 'cancelled': return 'Bekor qilindi';
    default: return status;
  }
}

export async function syncPricesWithGoogleSheets(
  pricesData: { sizes: BottleSize[]; flavors: Flavor[]; additives: Additive[] },
  webhookUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const url = webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) {
    return { success: false, error: 'Google Sheets Webhook URL sozlanmagan' };
  }

  try {
    const payload = {
      action: 'save_prices',
      sizes: pricesData.sizes.map((s) => ({
        id: s.id,
        name: s.nameUz,
        liters: s.liters,
        basePrice: s.basePrice,
        maxCapacityMg: s.maxCapacityMg,
      })),
      flavors: pricesData.flavors.map((f) => ({
        id: f.id,
        name: f.nameUz,
        pricePerMg: f.pricePerMg,
        caloriesPer100Mg: f.caloriesPer100Mg,
      })),
      additives: pricesData.additives.map((a) => ({
        id: a.id,
        name: a.nameUz,
        price: a.price,
        calories: a.calories,
      })),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Google Sheets xatosi: ${response.statusText}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Google Sheets sync prices error:', error);
    return { success: false, error: error.message || 'Narxlarni sinxronlashda xatolik' };
  }
}

export async function fetchPricesFromGoogleSheets(
  webhookUrl?: string
): Promise<{ success: boolean; data?: { sizes?: any[]; flavors?: any[]; additives?: any[] }; error?: string }> {
  const url = webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) {
    return { success: false, error: 'Google Sheets Webhook URL sozlanmagan' };
  }

  try {
    const fetchUrl = url.includes('?') ? `${url}&action=get_prices` : `${url}?action=get_prices`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { success: false, error: `Google Sheets xatosi: ${response.statusText}` };
    }

    const json = await response.json();
    if (json && (json.status === 'success' || json.sizes || json.flavors || json.additives)) {
      return { success: true, data: json };
    }

    return { success: false, error: json?.message || 'Narxlar topilmadi' };
  } catch (error: any) {
    console.error('Fetch prices from Google Sheets error:', error);
    return { success: false, error: error.message || 'Narxlarni yuklashda xatolik' };
  }
}

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// Google Sheets > Extensions > Apps Script da ushbu kodni qo'ying va "Deploy as Web App" qiling:

function doGet(e) {
  try {
    var action = e && e.parameter ? e.parameter.action : "";
    if (action === "get_prices") {
      return handleGetPrices();
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "ok", message: "FreshMix API ishlayapti" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    
    // 1. NARXLARNI OLISH (GET PRICES)
    if (data.action === "get_prices") {
      return handleGetPrices();
    }
    
    // 2. NARXLARNI SAQLASH (SAVE PRICES)
    if (data.action === "save_prices") {
      var priceSheet = getOrCreateSheet(ss, "Narxlar");
      priceSheet.clear();
      
      // Sarlavha
      priceSheet.appendRow(["Kategoriya", "ID", "Nomi", "Narxi (so'm)", "Qo'shimcha"]);
      priceSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#FFF3E0");
      
      // Bankalar
      if (data.sizes && data.sizes.length > 0) {
        for (var s = 0; s < data.sizes.length; s++) {
          var sz = data.sizes[s];
          priceSheet.appendRow(["Banka Hajmi", sz.id, sz.name || sz.id, sz.basePrice, sz.liters + "L (" + sz.maxCapacityMg + "mg)"]);
        }
      }
      
      // Ta'mlar
      if (data.flavors && data.flavors.length > 0) {
        for (var f = 0; f < data.flavors.length; f++) {
          var fl = data.flavors[f];
          priceSheet.appendRow(["Ta'm", fl.id, fl.name || fl.id, fl.pricePerMg, "100mg narxi"]);
        }
      }
      
      // Qo'shimchalar
      if (data.additives && data.additives.length > 0) {
        for (var a = 0; a < data.additives.length; a++) {
          var ad = data.additives[a];
          priceSheet.appendRow(["Qo'shimcha", ad.id, ad.name || ad.id, ad.price, "+" + (ad.calories || 0) + " kkal"]);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Narxlar muvaffaqiyatli saqlandi" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. BUYURTMALAR BILAN ISHLASH (Buyurtmalar varag'i)
    var orderSheet = getOrCreateSheet(ss, "Buyurtmalar");
    
    // Agar birinchi qator bo'sh bo'lsa, sarlavhalar qo'shamiz
    if (orderSheet.getLastRow() === 0) {
      orderSheet.appendRow([
        "Buyurtma ID", "Sana", "Mijoz Ismi", "Telefon", "Manzil", 
        "Izoh", "To'lov", "Holat", "Ichimliklar", "Jami Summa"
      ]);
      orderSheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#E0F2FE");
    }
    
    var lastRow = orderSheet.getLastRow();
    var lastCol = orderSheet.getLastColumn() || 10;
    
    var headers = orderSheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var colMap = {};
    for (var h = 0; h < headers.length; h++) {
      var hName = String(headers[h]).toLowerCase().trim();
      colMap[hName] = h + 1;
    }
    
    var statusCol = colMap["holat"] || colMap["status"] || 8;
    var nameCol = colMap["mijoz ismi"] || colMap["mijoz"] || colMap["ism"] || 3;
    var phoneCol = colMap["telefon"] || colMap["tel"] || 4;
    var addrCol = colMap["manzil"] || 5;
    var noteCol = colMap["izoh"] || 6;
    var payCol = colMap["to'lov"] || colMap["to'lov turi"] || 7;
    var priceCol = colMap["jami summa"] || colMap["summa"] || 10;
    
    var targetId = String(data.orderId || "").replace(/^#/, "").trim().toLowerCase();
    
    // A) BARCHA BUYURTMALARNI TOZALASH
    if (data.action === "clear_all_orders") {
      if (lastRow > 1) {
        orderSheet.getRange(2, 1, lastRow - 1, lastCol).clear();
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Barcha buyurtmalar tozalandi" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // B) BITTA BUYURTMANI O'CHIRISH
    if (data.action === "delete_order") {
      var deleteRow = -1;
      if (lastRow > 1) {
        var idRange = orderSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < idRange.length; i++) {
          var cVal = String(idRange[i][0]).replace(/^#/, "").trim().toLowerCase();
          if (cVal === targetId) {
            deleteRow = i + 2;
            break;
          }
        }
      }
      if (deleteRow > 0) {
        orderSheet.deleteRow(deleteRow);
        return ContentService.createTextOutput(JSON.stringify({ status: "success", deletedRow: deleteRow }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "not_found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // C) BUYURTMA STATUSINI YANGILASH
    if (data.action === "update_status") {
      var foundRow = -1;
      if (lastRow > 1) {
        var idRange2 = orderSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i2 = 0; i2 < idRange2.length; i2++) {
          var cVal2 = String(idRange2[i2][0]).replace(/^#/, "").trim().toLowerCase();
          if (cVal2 === targetId) {
            foundRow = i2 + 2;
            break;
          }
        }
      }
      
      if (foundRow > 0) {
        orderSheet.getRange(foundRow, statusCol).setValue(data.status);
        return ContentService.createTextOutput(JSON.stringify({ status: "success", updatedRow: foundRow }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ status: "not_found" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // D) BUYURTMANI TAHRIRLASH
    if (data.action === "edit_order") {
      var editRow = -1;
      if (lastRow > 1) {
        var idRange3 = orderSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i3 = 0; i3 < idRange3.length; i3++) {
          var cVal3 = String(idRange3[i3][0]).replace(/^#/, "").trim().toLowerCase();
          if (cVal3 === targetId) {
            editRow = i3 + 2;
            break;
          }
        }
      }
      
      if (editRow > 0) {
        if (data.customerName) orderSheet.getRange(editRow, nameCol).setValue(data.customerName);
        if (data.customerPhone) orderSheet.getRange(editRow, phoneCol).setValue(String(data.customerPhone));
        if (data.customerAddress) orderSheet.getRange(editRow, addrCol).setValue(data.customerAddress);
        if (data.notes !== undefined) orderSheet.getRange(editRow, noteCol).setValue(data.notes);
        if (data.paymentMethod) orderSheet.getRange(editRow, payCol).setValue(String(data.paymentMethod).toUpperCase());
        if (data.status) orderSheet.getRange(editRow, statusCol).setValue(data.status);
        if (data.totalAmount) orderSheet.getRange(editRow, priceCol).setValue(data.totalAmount);
        
        return ContentService.createTextOutput(JSON.stringify({ status: "success", editedRow: editRow }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // E) YANGI BUYURTMA QO'SHISH
    var existingRow = -1;
    if (lastRow > 1) {
      var idRange4 = orderSheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var j = 0; j < idRange4.length; j++) {
        var cVal4 = String(idRange4[j][0]).replace(/^#/, "").trim().toLowerCase();
        if (cVal4 === targetId) {
          existingRow = j + 2;
          break;
        }
      }
    }
    
    var itemsSummary = data.items ? data.items.map(function(item) {
      return item.quantity + "x " + item.drinkName + " (" + item.size + ") [" + item.flavors + "]";
    }).join("\\n") : "";
    
    var phoneStr = String(data.customerPhone || "");
    
    if (existingRow > 0) {
      orderSheet.getRange(existingRow, statusCol).setValue(data.status);
    } else {
      orderSheet.appendRow([
        data.orderId,
        data.createdAt,
        data.customerName,
        phoneStr,
        data.customerAddress,
        data.notes,
        data.paymentMethod,
        data.status,
        itemsSummary,
        data.totalAmount
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Yordamchi: Narxlar varag'idan o'qish
function handleGetPrices() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Narxlar");
  if (!sheet || sheet.getLastRow() < 2) {
    return ContentService.createTextOutput(JSON.stringify({ status: "empty", message: "Narxlar hali kiritilmagan" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  var sizes = [];
  var flavors = [];
  var additives = [];
  
  for (var i = 0; i < rows.length; i++) {
    var category = String(rows[i][0]).toLowerCase().trim();
    var id = String(rows[i][1]).trim();
    var name = String(rows[i][2]).trim();
    var price = Number(rows[i][3]) || 0;
    
    if (category.indexOf("banka") !== -1 || category.indexOf("hajm") !== -1) {
      sizes.push({ id: id, name: name, basePrice: price });
    } else if (category.indexOf("ta'm") !== -1 || category.indexOf("tam") !== -1 || category.indexOf("flavor") !== -1) {
      flavors.push({ id: id, name: name, pricePerMg: price });
    } else if (category.indexOf("qo'shimcha") !== -1 || category.indexOf("qoshimcha") !== -1 || category.indexOf("additive") !== -1) {
      additives.push({ id: id, name: name, price: price });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    sizes: sizes,
    flavors: flavors,
    additives: additives
  })).setMimeType(ContentService.MimeType.JSON);
}

// Yordamchi: Varag'ni topish yoki yaratish
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}
`;
