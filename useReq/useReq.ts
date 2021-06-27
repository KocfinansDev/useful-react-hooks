import { useCallback, useEffect, useRef, useState, MutableRefObject } from "react";
import { ApolloError } from "apollo-client";
import { errorModes } from "../../error";
import { useErrorHandler, useInterval, useIsMounted } from "../";

/**
 * Generic hook for continously fetching data
 * RUNS AT LEAST ONCE !
 *
 * Can be stopped by setting delay to `null`
 *
 * @param callback
 * @param delay
 * @param errMode
 */
export function useReqInterval<T>(
  callback: () => Promise<T | null>,
  delay: number | null,
  defaultValue: any = null,
  errMode: errorModes = errorModes.IGNORE
): { data: T | null; loading: boolean; error: ApolloError | null } {
  const { data, loading, error, refetch } = useReq(callback, defaultValue, errMode);
  useInterval(refetch, delay);
  return { data, loading, error };
}

interface RequestStatus<T> {
  loading: boolean;
  error: ApolloError | null;
  data: T;
}

interface ReqResponse<T> extends RequestStatus<T> {
  refetch: () => Promise<void>;
  // cancelRequest: () => void;
}

/**
 * Generic hook for fetching data and
 * automatic error handling
 *
 * !!! ~
 * callback should be passed inside useCallback()
 * hook to avoid unnecessary operations
 * 
 * BUG: if paramters change mid-request
 * might create a racing condition
 * need following inside useEffect;
 * 
 * let current = true;
 * return () => { current: false }
 *
 * @param callback
 * @param errorMode
 */
export function useReq<T>(
  callback: () => Promise<T>,
  defaultValue: any = null,
  errorMode: errorModes = errorModes.ERR_CODE,
  skip: boolean = false,
): ReqResponse<T> {

  const [{ loading, error, data }, setStatus] = useState<RequestStatus<T>>({
    loading: true,
    error: null,
    data: defaultValue,
  });

  const isMounted = useIsMounted();
  const handleError = useErrorHandler(errorMode);

  // keep a reference to latest data value to prevent rerender
  const currentState: MutableRefObject<any> = useRef({ loading, error, data });
  useEffect(() => { currentState.current = { loading, error, data }}, [loading, error, data]);

  const fetch = useCallback(async () => {
    if(isMounted()){
      try {
        setStatus({ loading: true, error: currentState.current.error, data: currentState.current.data })
        if(!skip) {
          const res = await callback();
          isMounted() && setStatus({ loading: false, error: null, data: res });
        }
      } catch (error) {
        if(isMounted()){
          setStatus({ loading: false, error, data: defaultValue });
          handleError(error);
        }
      }
    }
  }, [skip, isMounted, handleError, defaultValue, callback]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { loading, error, data, refetch: fetch };
}
