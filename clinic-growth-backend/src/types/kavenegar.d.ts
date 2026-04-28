declare module 'kavenegar' {
  export default function KavenegarApi(config: { apikey: string }): KavenegarApi;

  export interface KavenegarApi {
    Message: {
      Send(params: { sender: string; receptor: string; message: string }): Promise<MessageResult[]>;
      SendArray(params: { messages: MessageItem[] }): Promise<MessageResult[]>;
      Status(params: { messageid: number }): Promise<MessageStatusResult>;
    };
    Account: {
      Info(): Promise<AccountInfo>;
    };
  }

  export interface MessageResult {
    messageid: number;
    message: string;
    receptor: string;
    status: number;
    statustext: string;
  }

  export interface MessageStatusResult {
    messageid: number;
    status: number;
    statustext: string;
  }

  export interface MessageItem {
    sender: string;
    receptor: string;
    message: string;
  }

  export interface AccountInfo {
    level: string;
    credit: number;
    expire: number;
  }
}