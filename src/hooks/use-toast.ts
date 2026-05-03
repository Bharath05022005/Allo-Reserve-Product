"use client";

import * as React from "react";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type Action =
  | { type: "ADD_TOAST"; toast: ToastProps }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

type State = { toasts: ToastProps[] };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        if (!toastTimeouts.has(toastId)) {
          const timeout = setTimeout(() => {
            toastTimeouts.delete(toastId);
            dispatch({ type: "REMOVE_TOAST", toastId });
          }, TOAST_REMOVE_DELAY);
          toastTimeouts.set(toastId, timeout);
        }
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) return { ...state, toasts: [] };
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

export function toast({
  title,
  description,
  variant = "default",
}: {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}) {
  const id = genId();
  dispatch({
    type: "ADD_TOAST",
    toast: {
      id,
      title,
      description,
      variant,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dispatch({ type: "DISMISS_TOAST", toastId: id });
      },
    },
  });

  setTimeout(() => {
    dispatch({ type: "DISMISS_TOAST", toastId: id });
  }, 4000);

  return { id };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, [state]);

  return { toasts: state.toasts, toast };
}
