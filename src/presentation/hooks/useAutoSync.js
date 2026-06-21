import { useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncUsecases } from '../../domain/usecases/syncUsecases';

export const useAutoSync = () => {
  const lastStatus = useRef('unknown');

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isInternetReachable === null) return;

      const isCurrentlyOnline = state.isConnected && state.isInternetReachable;

      if (isCurrentlyOnline) {
        if (lastStatus.current === 'offline' || lastStatus.current === 'unknown') {
          console.log("[Auto-Sync] Internet KONEK.");

          setIsSyncing(true);

          syncUsecases.processOfflineQueue()
            .then(result => {
              console.log("[Auto-Sync] Selesai:", result);
            })
            .catch(error => {
              console.error("[Auto-Sync] Error:", error);
            })
            .finally(() => {
              setTimeout(() => {
                setIsSyncing(false);
              }, 2000);
            });
        }
        lastStatus.current = 'online';
        
      } else {
        if (lastStatus.current === 'online' || lastStatus.current === 'unknown') {
          console.log("[Auto-Sync] Internet TERPUTUS!");
        }
        lastStatus.current = 'offline';
      }
    });

    return () => unsubscribe();
  }, []);

  return { isSyncing };
};