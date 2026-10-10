import { useQuery } from "@tanstack/react-query";
import {
  EVENTS_REQUIRED,
  ROBOTICS_REQUIRED,
  SHEET_URLS,
  SheetFormatError,
  VCS_REQUIRED,
  fetchSheet,
  toEvents,
  toInvestors,
  toRobotics,
} from "@/lib/sheets";

// A changed sheet layout will not fix itself on retry; network errors get one retry.
const retry = (failureCount: number, error: unknown) => !(error instanceof SheetFormatError) && failureCount < 1;

/** Live events directory, cached by React Query so filters never refetch. */
export const useEventsDirectory = () =>
  useQuery({
    queryKey: ["directory", "events"],
    queryFn: async () => toEvents(await fetchSheet(SHEET_URLS.events, EVENTS_REQUIRED)),
    retry,
  });

export const useInvestorDirectory = () =>
  useQuery({
    queryKey: ["directory", "vcs"],
    queryFn: async () => toInvestors(await fetchSheet(SHEET_URLS.vcs, VCS_REQUIRED)),
    retry,
  });

export const useRoboticsDirectory = () =>
  useQuery({
    queryKey: ["directory", "robotics"],
    queryFn: async () => toRobotics(await fetchSheet(SHEET_URLS.robotics, ROBOTICS_REQUIRED)),
    retry,
  });
