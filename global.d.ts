// telegram.d.ts
declare global {
  interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  }
  
  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
      query_id: string;
      user: TelegramUser;
    };
    close: () => void;
    ready: () => void;
    MainButton: {
      setText: (text: string) => void;
      show: () => void;
      hide: () => void;
      onClick: (callback: () => void) => void;
    };
  }
  
    interface Window {
      tg?: {
        getUserId(): Promise<number>; // Определите метод getUserId и его тип в соответствии с документацией Telegram Web App
        // Добавьте другие методы, которые вы будете использовать
      };
    }
  
  
  }