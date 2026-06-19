import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "querystring";

function normalizeSearch(search: string) {
  return search.startsWith("?") ? search.slice(1) : search;
}

export function useQueryParams<
  T extends Record<string, any> = Record<string, string>
>(defaultValues?: T) {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => {
    const parsed = queryString.parse(normalizeSearch(location.search));

    return {
      ...(defaultValues || {}),
      ...parsed,
    } as T;
  }, [location.search, defaultValues]);

  const setParams = useCallback(
    (newValues: Partial<T>) => {
      const parsed = queryString.parse(normalizeSearch(location.search));

      const cleaned = Object.fromEntries(
        Object.entries({ ...parsed, ...newValues }).filter(
          ([_, v]) => v !== "" && v !== null && v !== undefined
        )
      );

      const search = queryString.stringify(cleaned);

      navigate({
        pathname: location.pathname,
        search: search ? `?${search}` : "",
      });
    },
    [navigate, location.pathname, location.search]
  );

  return { params, setParams };
}
