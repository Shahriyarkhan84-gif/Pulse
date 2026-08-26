type Listener = (error: Error) => void;

let listener: Listener | null = null;
let pending: Error | null = null;

/** Routes an error to the on-screen CrashScreen instead of letting the app silently die. */
export function reportCrash(error: Error) {
  pending = error;
  listener?.(error);
}

export function onCrash(callback: Listener) {
  listener = callback;
  if (pending) callback(pending);
}
