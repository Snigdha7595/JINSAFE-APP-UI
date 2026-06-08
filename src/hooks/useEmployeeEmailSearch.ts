import { useState, useCallback } from "react";
import debounce from "lodash.debounce";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_USER } from "@/config/apiConfig";
import { CONSTANTS } from "@/config/constant";

export function useEmployeeEmailSearch(token: string) {
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(
    async (inputValue: string) => {
      if (!inputValue || inputValue.trim().length < 3) return [];

      setLoading(true);
      try {
        const response = await serverRequest(
          {},
          `${FETCH_USER}/Search/${encodeURIComponent(inputValue)}`,
          CONSTANTS.REQUEST_GET,
          true,
          true,
          token
        );

        if (Array.isArray(response)) {
          return response.map((u: any) => ({
            value: u.empEmail,
            label: `${u.empName} (${u.empEmail})`,
            userData: u,
          }));
        }
        return [];
      } catch (err) {
        console.error("Error fetching users:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { loading, handleSearch };
}