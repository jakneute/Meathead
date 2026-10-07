import { useEffect, useRef } from 'react';
import { playCursor, playMenuOk, playMenuBack } from '../game/platform/audio';

/**
 * The menus' cursor sound: plays when `value` (what's highlighted) changes. Not on first showing, nor when `context`
 * changes along with it (a new screen putting the cursor back at the top isn't a move), nor while `on` is false.
 */
export const useCursorSound = (value: unknown, on = true, context: unknown = null) => {
  const last = useRef({ value, context });
  useEffect(() => {
    const was = last.current;
    last.current = { value, context };
    if (!on || value === null || value === undefined) return;
    if (was.context === context && was.value !== value) playCursor();
  }, [value, on, context]);
};

/**
 * A menu's OK and BACK, off something opening and closing: `open` going true plays OK, going false plays BACK (not on
 * first showing, nor while `on` is false). For a panel, a prompt, a screen within a screen.
 */
export const useOpenCloseSound = (open: boolean, on = true) => {
  const last = useRef(open);
  useEffect(() => {
    const was = last.current;
    last.current = open;
    if (!on || was === open) return;
    if (open) playMenuOk(); else playMenuBack();
  }, [open, on]);
};
