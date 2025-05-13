import { useSession } from "@clerk/clerk-react";
import { useState, useCallback } from "react";

const useFetch = (cb, initialOptions = {}) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState(initialOptions);

  const { session } = useSession();

  const fn = useCallback(async (newOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const supabaseAccessToken = await session.getToken({
        template: "supabase",
      });
      const mergedOptions = { ...options, ...newOptions };
      const response = await cb(supabaseAccessToken, mergedOptions);
      setData(response);
      setError(null);
    } catch (error) {
      console.error("Error in useFetch:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [cb, options, session]);

  return { data, loading, error, fn };
};

export default useFetch;