// src/hooks/useCrud.js
// create / update / remove with optimistic updates and rollback.
//
// ASSUMPTION: REST routes are POST <base>, PUT <base><id>, DELETE <base><id>.
// Check them against your Go router and adjust `updateMethod` / paths if they differ.
import { useCallback } from "react";
import api from "../services/api";

export function useCrud(basePath, { data, setData, reload, idOf = (x) => x.id, updateMethod = "put" }) {
  const create = useCallback(
    async (payload) => {
      const res = await api.post(basePath, payload);
      await reload(); // response shape varies; the list is the source of truth
      return res.data;
    },
    [basePath, reload]
  );

  const update = useCallback(
    async (id, changes) => {
      const snapshot = data;
      setData((prev) => prev.map((x) => (idOf(x) === id ? { ...x, ...changes } : x)));
      try {
        const res = await api[updateMethod](`${basePath}${id}`, changes);
        return res.data;
      } catch (err) {
        setData(snapshot); // roll back
        throw err;
      }
    },
    [basePath, data, setData, idOf, updateMethod]
  );

  const remove = useCallback(
    async (id) => {
      const snapshot = data;
      setData((prev) => prev.filter((x) => idOf(x) !== id));
      try {
        await api.delete(`${basePath}${id}`);
      } catch (err) {
        setData(snapshot);
        throw err;
      }
    },
    [basePath, data, setData, idOf]
  );

  return { create, update, remove };
}