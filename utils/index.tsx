import { Calendar, CalendarDays, CalendarRange, Inbox } from "lucide-react";

export const primaryNavItems = [
  {
    id: "primary",
    name: "Inbox",
    link: "/loggedin",
    icon: <Inbox className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  },
  {
    name: "Today",
    link: "/loggedin/today",
    icon: <Calendar className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  },
  {
    name: "Upcoming",
    link: "/loggedin/upcoming",
    icon: <CalendarRange className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  },
  {
    name: "Calendar",
    link: "/loggedin/calendar",
    icon: <CalendarDays className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  },
];
