// Fire-and-forget status messages, shown by components/Toast.tsx.
export const TOAST_EVENT = "site:toast";

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }));
}
