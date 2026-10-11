import { useQuery } from "@tanstack/react-query";
import { EVENTS_REQUIRED, SHEET_URLS, SheetFormatError, fetchSheet, toEvents } from "@/lib/sheets";

/** Events from the public Google Sheet, mapped by header name and cached by React Query. */
export function useTechEvents() {
  return useQuery({
    queryKey: ["sheet", "events"],
    queryFn: async () => toEvents(await fetchSheet(SHEET_URLS.events, EVENTS_REQUIRED)),
    staleTime: 10 * 60 * 1000,
    // A changed sheet layout will not fix itself on retry; network errors might.
    retry: (failureCount, error) => !(error instanceof SheetFormatError) && failureCount < 2,
  });
}
