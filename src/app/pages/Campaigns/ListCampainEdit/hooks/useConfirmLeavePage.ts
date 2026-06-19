import { useCallback, useContext, useEffect, useState } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

type Props = {
  when: boolean;
  onOpenModal: () => void;
};

type BlockerState = "unblocked" | "blocked";

type Transition = {
  retry: () => void;
};

export const useBlocker = (when: boolean) => {
  const navigator = useContext(UNSAFE_NavigationContext).navigator as any;
  const [state, setState] = useState<BlockerState>("unblocked");
  const [tx, setTx] = useState<Transition | null>(null);

  useEffect(() => {
    if (!when) return;
    if (!navigator?.block) return;

    const unblock = navigator.block((transition: Transition) => {
      // Important: if we retry while still blocked, it will immediately block again.
      // So we always unblock first, then retry the transition.
      const autoUnblockingTx: Transition = {
        retry: () => {
          unblock();
          transition.retry();
        },
      };

      setTx(autoUnblockingTx);
      setState("blocked");
    });

    return unblock;
  }, [navigator, when]);

  const proceed = useCallback(() => {
    setTx(null);
    setState("unblocked");
    tx?.retry?.();
  }, [tx]);

  const reset = useCallback(() => {
    setTx(null);
    setState("unblocked");
  }, []);

  return { state, proceed, reset };
};

export const useConfirmLeavePage = ({ when, onOpenModal }: Props) => {
  const blocker = useBlocker(when);

  useEffect(() => {
    if (blocker.state === "blocked") onOpenModal();
  }, [blocker.state, onOpenModal]);
};
