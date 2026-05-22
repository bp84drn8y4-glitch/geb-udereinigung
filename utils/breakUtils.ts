export const calculateAutomaticBreak = (durationMs: number): number => {
    const NINE_HOURS_MS = 9 * 60 * 60 * 1000;
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    const FORTY_FIVE_MIN_MS = 45 * 60 * 1000;
    const THIRTY_MIN_MS = 30 * 60 * 1000;

    if (durationMs > NINE_HOURS_MS) {
        return FORTY_FIVE_MIN_MS;
    }
    if (durationMs > SIX_HOURS_MS) {
        return THIRTY_MIN_MS;
    }
    return 0;
};
