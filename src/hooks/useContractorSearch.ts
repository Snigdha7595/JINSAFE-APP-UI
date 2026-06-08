import { useState, useCallback } from "react";
import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS } from "@/config/constant";
import { FETCH_CSM } from "@/config/apiConfig";

export function useContractorSearch(token: string) {
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(
    async (inputValue: string) => {
      if (!inputValue || inputValue.trim().length < 3) return [];

      const isCode = /^\d+$/.test(inputValue);

      const payload = {
        ContractorCode: isCode ? inputValue : "",
        ContractorName: isCode ? "" : inputValue,
      };

      setLoading(true);

      try {
        const response = await serverRequest(
          payload,
          `${FETCH_CSM}/Contractor/search-contractors`, 
          CONSTANTS.REQUEST_POST,
          true,
          true,
          token
        );

        if (Array.isArray(response)) {
          return response.map((c: any) => ({
            value: c.contractorName,
            label: `${c.contractorCode} - ${c.contractorName}`,
            userData: c,
          }));
        }

        return [];
      } catch (error) {
        console.error("Contractor search failed:", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { loading, handleSearch };
}