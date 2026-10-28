// src/hooks/useLiveSync.js
// Keeps a list in sync with the WebSocket events <prefix>_created / _updated / _deleted.
import { useEffect } from "react";

export function useLiveSync({ path, prefix, setData, enabled = true, idOf = (x) => x.id }) {
  useEffect(() => {
    if (!enabled) return;
    const WS_URL =
      import.meta.env.VITE_WS_URL || "wss://taskflow-api.inengiyeemmanuel.site";
    const ws = new WebSocket(`${WS_URL}${path}`);

    ws.onmessage = (e) => {
      let msg;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      if (!msg?.data) return;
      const id = idOf(msg.data);
      if (msg.type === `${prefix}_created`)
        setData((prev) => (prev.some((x) => idOf(x) === id) ? prev : [...prev, msg.data]));
      else if (msg.type === `${prefix}_updated`)
        setData((prev) => prev.map((x) => (idOf(x) === id ? msg.data : x)));
      else if (msg.type === `${prefix}_deleted`)
        setData((prev) => prev.filter((x) => idOf(x) !== id));
    };

    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, prefix, enabled, setData]);
}