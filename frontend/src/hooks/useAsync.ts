import { useEffect, useState } from "react"

const useAsync = <T>(action: () => Promise<T>, onSuccess: (response: T) => void, onError: (error: any) => void) => {
   const[isLoading, setIsLoading] = useState<boolean>(false);
    useEffect(() => {
     
             action().then((response: any) => {
              onSuccess(response?.data)  
             }).catch(error => {
                onError(error)
             }).finally(() => {
               setIsLoading(true);
             });
       }, []);

       return isLoading;
   }


export default useAsync;