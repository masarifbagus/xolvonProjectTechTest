import { useEffect } from "react";
import { useRouter } from "next/navigation";

export interface ShortcutHandlers {
  onSearchFocus?: () => void;
  onToggleCart?: () => void;
  onCheckout?: () => void;
  onEscape?: () => void;
  onToggleHelp?: () => void;
}

export function useKeyboardShortcuts({
  onSearchFocus,
  onToggleCart,
  onCheckout,
  onEscape,
  onToggleHelp,
}: ShortcutHandlers = {}) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target !== null &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // F1: Focus product search (overrides typing context as per spec)
      if (e.key === "F1") {
        e.preventDefault();
        onSearchFocus?.();
        return;
      }

      // Ignore shortcuts if user is typing inside an input/textarea (except Escape for blur/modal)
      if (isTyping && e.key !== "Escape") {
        return;
      }

      // F9: Toggle cart sidebar
      if (e.key === "F9") {
        e.preventDefault();
        onToggleCart?.();
        return;
      }

      // F12: Trigger checkout
      if (e.key === "F12") {
        e.preventDefault();
        onCheckout?.();
        return;
      }

      // Escape: Close active modal or sidebar
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }

      // Ctrl+H / Cmd+H: Navigate to transaction history
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        router.push("/transactions");
        return;
      }

      // Ctrl+P / Cmd+P: Navigate to product management (prevents browser print dialog)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        router.push("/");
        return;
      }

      // Shift+? or ?: Open shortcut modal
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        if (!isTyping) {
          e.preventDefault();
          onToggleHelp?.();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, onSearchFocus, onToggleCart, onCheckout, onEscape, onToggleHelp]);
}
