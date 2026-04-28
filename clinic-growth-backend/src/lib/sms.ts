// @ts-ignore
import Kavenegar from 'kavenegar';

const API_KEY = process.env.KAVENEGAR_API_KEY;
const SENDER = process.env.KAVENEGAR_SENDER || '10004346';

let kavenegarClient: any = null;

async function getKavenegar(): Promise<any> {
  if (kavenegarClient) return kavenegarClient;
  
  if (API_KEY) {
    try {
      // @ts-ignore
      kavenegarClient = Kavenegar(API_KEY);
    } catch (e) {
      console.warn('Kavenegar client initialization failed:', e);
    }
  }
  return kavenegarClient;
}

export interface SMSResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

export async function sendVerificationSMS(
  mobile: string,
  otpCode: string,
  type: 'register' | 'login'
): Promise<SMSResult> {
  const cleanMobile = mobile.replace(/^0/, '');
  const message = type === 'register'
    ? `کد تایید ثبت نام شما در کلینیک زیبایی آرام: ${otpCode}`
    : `کد تایید ورود شما به کلینیک زیبایی آرام: ${otpCode}`;

// In development, just log
  if (process.env.NODE_ENV === 'development' || !API_KEY) {
    console.log(`[SMS Dev] Sending to ${mobile}: ${message}`);
    return {
      success: true,
      messageId: Math.floor(Math.random() * 100000),
    };
  }

  try {
    const client = await getKavenegar();
    if (!client) {
      return { success: false, error: 'SMS client not initialized' };
    }

    const result = await client.Message.Send({
      sender: SENDER,
      receptor: cleanMobile,
      message: message,
    });

    if (result && result[0]?.messageid) {
      return {
        success: true,
        messageId: result[0].messageid,
      };
    }

    return {
      success: false,
      error: 'Failed to send SMS',
    };
  } catch (error: any) {
    console.error('Kavenegar error:', error);
    return {
      success: false,
      error: error.message || 'SMS sending failed',
    };
  }
}

export async function sendWelcomeSMS(
  mobile: string,
  fullName: string
): Promise<SMSResult> {
  const cleanMobile = mobile.replace(/^0/, '');
  const message = `${fullName} عزیز، به کلینیک زیبایی آرام خوش آمدید!`;

  if (process.env.NODE_ENV === 'development' || !API_KEY) {
    console.log(`[SMS Dev] Welcome to ${mobile}: ${message}`);
    return {
      success: true,
      messageId: Math.floor(Math.random() * 100000),
    };
  }

  try {
    const client = await getKavenegar();
    if (!client) {
      return { success: false, error: 'SMS client not initialized' };
    }

    const result = await client.Message.Send({
      sender: SENDER,
      receptor: cleanMobile,
      message: message,
    });

    if (result && result[0]?.messageid) {
      return {
        success: true,
        messageId: result[0].messageid,
      };
    }

    return {
      success: false,
      error: 'Failed to send SMS',
    };
  } catch (error: any) {
    console.error('Kavenegar error:', error);
    return {
      success: false,
      error: error.message || 'SMS sending failed',
    };
  }
}

export async function sendAppointmentReminder(
  mobile: string,
  dateTime: string,
  serviceName: string
): Promise<SMSResult> {
  const cleanMobile = mobile.replace(/^0/, '');
  const message = `یادآوری نوبت: شما نوبت ${serviceName} در تاریخ ${dateTime} دارید.`;

  if (process.env.NODE_ENV === 'development' || !API_KEY) {
    console.log(`[SMS Dev] Reminder to ${mobile}: ${message}`);
    return { success: true };
  }

  try {
    const client = await getKavenegar();
    if (!client) {
      return { success: false, error: 'SMS client not initialized' };
    }

    const result = await client.Message.Send({
      sender: SENDER,
      receptor: cleanMobile,
      message: message,
    });

    return { success: !!result, messageId: result?.[0]?.messageid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendCancellationNotice(
  mobile: string,
  serviceName: string,
  reason?: string
): Promise<SMSResult> {
  const cleanMobile = mobile.replace(/^0/, '');
  const message = `نوبت ${serviceName} شما لغو شد.${reason ? `\nدلیل: ${reason}` : ''}`;

  if (process.env.NODE_ENV === 'development' || !API_KEY) {
    console.log(`[SMS Dev] Cancellation to ${mobile}: ${message}`);
    return { success: true };
  }

  try {
    const client = await getKavenegar();
    if (!client) {
      return { success: false, error: 'SMS client not initialized' };
    }

    const result = await client.Message.Send({
      sender: SENDER,
      receptor: cleanMobile,
      message: message,
    });

    return { success: !!result, messageId: result?.[0]?.messageid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export default {
  sendVerificationSMS,
  sendWelcomeSMS,
  sendAppointmentReminder,
  sendCancellationNotice,
};