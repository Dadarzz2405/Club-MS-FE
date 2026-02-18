import { useEffect, useState } from "react";
import { calendarApi } from "@/api/misc";
import type { CalendarEvent } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar as CalIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    calendarApi.getEvents()
      .then((res) => setEvents(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

  const monthStr = currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.start === dateStr);
  };

  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  // Get events for the current month for list view
  const monthEvents = events.filter((e) => {
    const d = new Date(e.start);
    return d.getFullYear() === year && d.getMonth() === month;
  }).sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Calendar</h1>
        <p className="page-description">Sessions and Islamic holidays</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-lg font-display">{monthStr}</CardTitle>
            <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
            {days.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              return (
                <div key={i} className={`min-h-[72px] p-1 border border-border/50 ${day ? "" : "bg-muted/30"} ${day && isToday(day) ? "bg-primary/5 ring-1 ring-primary/30" : ""}`}>
                  {day && (
                    <>
                      <span className={`text-xs font-medium ${isToday(day) ? "text-primary font-bold" : ""}`}>{day}</span>
                      <div className="space-y-0.5 mt-0.5">
                        {dayEvents.slice(0, 2).map((e, j) => (
                          <div key={j} className={`text-[10px] truncate rounded px-1 py-0.5 ${e.extendedProps.type === "islamic_holiday" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"}`}>
                            {e.title.length > 20 ? e.title.substring(0, 18) + "…" : e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 2}</span>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event List */}
      <Card>
        <CardHeader><CardTitle className="text-lg font-display">Events this Month</CardTitle></CardHeader>
        <CardContent>
          {monthEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events this month</p>
          ) : (
            <div className="space-y-2">
              {monthEvents.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${e.extendedProps.type === "islamic_holiday" ? "bg-info" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.start}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">
                    {e.extendedProps.type === "islamic_holiday" ? "Holiday" : "Session"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
