import React, { useMemo } from "react";

interface IApiResponse<Type> {
  code: number;
  data: Type | null;
  errorMessage: string | null;
}

type IApiHook<Type> = [
  data: Type | null,
  loading: boolean,
  error: string | null,
  code: number,
]

export const apiRequest = async (endpoint: string, init: RequestInit): Promise<IApiResponse<any>> => {
  try {
    const result = await window.fetch(`http://localhost:8080/v1${endpoint}`, init);
    const json = await result.json() as IApiResponse<any>;
    return json;
  } catch(err) {
    throw(err);
  }
}

export const useApi = (endpoint: string, init: RequestInit): IApiHook<any> => {
  const [code, setCode] = React.useState<number>(0);
  const [data, setData] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const apiReq = async () => {
      try {
        setLoading(true);
        const result = await apiRequest(endpoint, init);
        setCode(result.code);
        setData(result.data);
        setError(result.errorMessage);
      } catch(err) {
        setCode(500);
        setData(null);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
      setLoading(true);
    }

    apiReq();
  }, [endpoint, init]);

  return [data, loading, error, code];
}

export const useApiGet = (endpoint: string): IApiHook<any> => {
  const optionsMemo: RequestInit = useMemo(() => ({
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8'
    },
  }), [])

  const apiResult = useApi(endpoint, optionsMemo);

  return apiResult;
}

export const useCategorySearch = (searchTerm: string): IApiHook<any> => {
  // reuses code from useApi as cannot conditionally call hook
  const [code, setCode] = React.useState<number>(0);
  const [data, setData] = React.useState<any[] | null>([])
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const timerRef = React.useRef<any>(null);

  React.useEffect(() => {
    const apiReq = async () => {
      try {
        const options = {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
          },
        }
        setLoading(true);
        const result = await apiRequest(`/categories/search/${searchTerm}`, options);
        setCode(result.code);
        setData(result.data);
        setError(result.errorMessage);
      } catch(err) {
        setCode(500);
        setData([]);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
      setLoading(true);
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (searchTerm.length > 2) {
        apiReq();
      } else {
        setData([]);
      }
    }, 300);
  }, [searchTerm]);

  return [data, loading, error, code];
}