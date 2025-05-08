"use client";

import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

// Message 类型定义
type MessageType = "success" | "error" | "info" | "warning" | "loading";

interface MessageInstance {
  key: string;
  type: MessageType;
  content: React.ReactNode;
  duration?: number;
  icon?: React.ReactNode;
}

interface MessageContextType {
  addMessage: (message: Omit<MessageInstance, "key">) => void;
  removeMessage: (key: string) => void;
  removeAllMessages: () => void;
}

// 创建 Context
const MessageContext = createContext<MessageContextType | null>(null);

// 全局 context 类型
declare global {
  interface Window {
    __MESSAGE_CONTEXT__: MessageContextType | null;
  }
}

// Message Provider 组件
export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<MessageInstance[]>([]);
  const [isClient, setIsClient] = useState(false);

  // 使用 useEffect 来处理客户端初始化
  useEffect(() => {
    setIsClient(true);
  }, []);

  const addMessage = useCallback(
    (message: Omit<MessageInstance, "key">) => {
      // 使用时间戳和递增计数器来生成稳定的 key
      const key = `msg_${Date.now()}_${messages.length}`;
      setMessages((prev) => [...prev, { ...message, key }]);

      // 添加自动移除定时器
      if (message.duration !== 0) {
        setTimeout(() => {
          setMessages((prev) => prev.filter((msg) => msg.key !== key));
        }, (message.duration || 5000) + 300); // 等待显示时间 + 退出动画时间
      }
    },
    [messages.length]
  );

  const removeMessage = useCallback((key: string) => {
    setMessages((prev) => prev.filter((msg) => msg.key !== key));
  }, []);

  const removeAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <MessageContext.Provider
      value={{ addMessage, removeMessage, removeAllMessages }}
    >
      {children}
      {isClient &&
        createPortal(
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3">
            {messages.map((message) => (
              <div
                key={message.key}
                className={clsx(
                  "px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-[400px]",
                  "flex items-center gap-3 backdrop-blur-sm",
                  "border border-opacity-20",
                  "animate-message",
                  {
                    "bg-green-500/5 border-green-500/20 text-green-400":
                      message.type === "success",
                    "bg-red-500/5 border-red-500/20 text-red-400":
                      message.type === "error",
                    "bg-blue-500/5 border-blue-500/20 text-blue-400":
                      message.type === "info",
                    "bg-yellow-500/5 border-yellow-500/20 text-yellow-400":
                      message.type === "warning",
                    "bg-gray-500/5 border-gray-500/20 text-gray-400":
                      message.type === "loading",
                  }
                )}
              >
                {message.icon && (
                  <span className="flex-shrink-0 text-lg">{message.icon}</span>
                )}
                <span className="flex-grow text-sm font-medium">
                  {message.content}
                </span>
              </div>
            ))}
          </div>,
          document.body
        )}
    </MessageContext.Provider>
  );
}

// 添加全局样式
const MessageStyles = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes messageEnter {
        0% {
          opacity: 0;
          transform: translateY(-40px) scale(0.95);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    
      @keyframes messageExit {
        0% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-40px) scale(0.95);
        }
      }
    
      .animate-message {
        animation: 
          messageEnter 0.3s ease-out forwards,
          messageExit 0.3s ease-in forwards 2.3s;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

// 修改 MessageProvider 组件以包含 MessageHandler 和 MessageStyles
export function MessageProviderWithHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MessageProvider>
      <MessageHandler />
      <MessageStyles />
      {children}
    </MessageProvider>
  );
}

// 使用 Message 的 Hook
function useMessage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
}

// 创建 message 对象
const message = {
  success: (
    content: React.ReactNode,
    duration?: number,
    icon?: React.ReactNode
  ) => {
    if (typeof window === "undefined") return;
    const event = new CustomEvent("show-message", {
      detail: { type: "success", content, duration, icon },
    });
    window.dispatchEvent(event);
  },
  error: (
    content: React.ReactNode,
    duration?: number,
    icon?: React.ReactNode
  ) => {
    if (typeof window === "undefined") return;
    const event = new CustomEvent("show-message", {
      detail: { type: "error", content, duration, icon },
    });
    window.dispatchEvent(event);
  },
  info: (
    content: React.ReactNode,
    duration?: number,
    icon?: React.ReactNode
  ) => {
    if (typeof window === "undefined") return;
    const event = new CustomEvent("show-message", {
      detail: { type: "info", content, duration, icon },
    });
    window.dispatchEvent(event);
  },
  warning: (
    content: React.ReactNode,
    duration?: number,
    icon?: React.ReactNode
  ) => {
    if (typeof window === "undefined") return;
    const event = new CustomEvent("show-message", {
      detail: { type: "warning", content, duration, icon },
    });
    window.dispatchEvent(event);
  },
  loading: (
    content: React.ReactNode,
    duration?: number,
    icon?: React.ReactNode
  ) => {
    if (typeof window === "undefined") return;
    const event = new CustomEvent("show-message", {
      detail: { type: "loading", content, duration, icon },
    });
    window.dispatchEvent(event);
  },
  destroy: () => {
    if (typeof window === "undefined") return;
    const event = new CustomEvent("show-message", {
      detail: { type: "destroy" },
    });
    window.dispatchEvent(event);
  },
};

// 创建一个内部组件来处理消息事件
function MessageHandler() {
  const { addMessage, removeAllMessages } = useMessage();

  React.useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      const { type, content, duration, icon } = event.detail;
      if (type === "destroy") {
        removeAllMessages();
      } else {
        addMessage({ type, content, duration, icon });
      }
    };

    window.addEventListener("show-message", handleMessage as EventListener);
    return () => {
      window.removeEventListener(
        "show-message",
        handleMessage as EventListener
      );
    };
  }, [addMessage, removeAllMessages]);

  return null;
}

export { message };
