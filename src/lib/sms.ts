// SMS Integration Adapter for Tanzanian Secondary Schools
import { SMSLog } from '../types';

export interface SMSConfig {
  provider: 'SIMULATOR' | 'BEEM_AFRICA' | 'NEXT_SMS' | 'TWILIO';
  senderId: string;
  apiKey?: string;
  secretKey?: string;
  isLive: boolean;
  costPerSmsTZS: number;
}

export const DEFAULT_SMS_CONFIG: SMSConfig = {
  provider: 'SIMULATOR',
  senderId: 'ELIMU-PRO',
  isLive: false,
  costPerSmsTZS: 25, // 25 TZS standard Tanzanian bulk SMS rate
};

/**
 * Validate Tanzanian phone numbers (+255 or 07xx / 06xx)
 */
export function isValidTzPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
  const tzRegex = /^(?:\+255|255|0)(?:6[1-9]|7[1-9])[0-9]{7}$/;
  return tzRegex.test(cleaned);
}

/**
 * Normalize phone number to international 255XXXXXXXXX format
 */
export function normalizeTzPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '255' + cleaned.substring(1);
  } else if (!cleaned.startsWith('255') && cleaned.length === 9) {
    cleaned = '255' + cleaned;
  }
  return cleaned;
}

/**
 * Generate official Swahili SMS message templates
 */
export function buildResultSmsText(
  schoolName: string,
  studentName: string,
  admissionNo: string,
  examName: string,
  division: string,
  points: number,
  average: number
): string {
  return `SHULE: ${schoolName}\nMatokeo ya ${examName}:\nJina: ${studentName} (${admissionNo})\nDaraja (Div): ${division} | Points: ${points} | Wastani: ${average}%\nRipoti kamili inapatikana tovuti ya shule. Hongera!`;
}

export function buildAttendanceAlertSmsText(
  schoolName: string,
  studentName: string,
  date: string,
  status: string
): string {
  return `SHULE: ${schoolName}\nTaarifa ya Mahudhurio:\nMwanafunzi ${studentName} hakuwepo shuleni tarehe ${date} bila ruhusa rasmi. Tafadhali wasiliana na Uongozi wa Shule haraka.`;
}

/**
 * Dispatches SMS via adapter
 */
export async function sendSMS(
  recipientPhone: string,
  recipientName: string,
  message: string,
  messageType: SMSLog['messageType'],
  studentAdmissionNo?: string,
  config: SMSConfig = DEFAULT_SMS_CONFIG
): Promise<{ success: boolean; log: SMSLog; error?: string }> {
  const normalized = normalizeTzPhone(recipientPhone);

  if (!isValidTzPhone(normalized)) {
    return {
      success: false,
      log: {
        id: `sms_${Date.now()}`,
        recipientPhone,
        recipientName,
        studentAdmissionNo,
        messageType,
        content: message,
        status: 'FAILED',
        sentAt: new Date().toISOString(),
        costTZS: 0,
      },
      error: 'Invalid Tanzanian telephone number. Format: 07XXXXXXXX or 06XXXXXXXX',
    };
  }

  // If in SIMULATOR mode, simulate successful delivery
  if (!config.isLive || config.provider === 'SIMULATOR') {
    const log: SMSLog = {
      id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipientPhone: normalized,
      recipientName,
      studentAdmissionNo,
      messageType,
      content: message,
      status: 'SIMULATED',
      sentAt: new Date().toISOString(),
      costTZS: config.costPerSmsTZS,
    };
    return { success: true, log };
  }

  // Live provider integration stub
  return {
    success: false,
    log: {
      id: `sms_${Date.now()}`,
      recipientPhone: normalized,
      recipientName,
      studentAdmissionNo,
      messageType,
      content: message,
      status: 'FAILED',
      sentAt: new Date().toISOString(),
      costTZS: 0,
    },
    error: 'Live SMS provider requires configured API credentials in settings.',
  };
}
