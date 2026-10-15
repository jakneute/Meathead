/** The public build (`npm run release:public`, and the desktop app's, `--mode steam`): no cheat panel, and START GAME always plays the intro. */
export const PUBLIC_BUILD = import.meta.env.MODE === 'public' || import.meta.env.MODE === 'steam';
