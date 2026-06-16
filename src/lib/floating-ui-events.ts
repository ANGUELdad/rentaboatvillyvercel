/** Lightweight coordination between chat UI and package teaser popups */
export const CHAT_NOTIFICATION_EVENT = "tbc-chat-notification";
export const CHAT_OPEN_EVENT = "tbc-chat-open";
export const CHAT_REQUEST_OPEN_EVENT = "tbc-chat-request-open";

export function setChatNotificationVisible(visible: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CHAT_NOTIFICATION_EVENT, { detail: { visible } }),
  );
}

export function setChatOpenVisible(visible: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CHAT_OPEN_EVENT, { detail: { visible } }),
  );
}

export function requestOpenChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHAT_REQUEST_OPEN_EVENT));
}

export function onChatRequestOpen(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = () => handler();
  window.addEventListener(CHAT_REQUEST_OPEN_EVENT, listener);
  return () => window.removeEventListener(CHAT_REQUEST_OPEN_EVENT, listener);
}
