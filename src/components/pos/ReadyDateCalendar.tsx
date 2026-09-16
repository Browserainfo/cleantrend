import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface ReadyDateCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  holidayDayOfWeek?: number; // 4 for Thursday (0 = Sunday, 1 = Monday, ..., 4 = Thursday)
}

export const ReadyDateCalendar: React.FC<ReadyDateCalendarProps> = ({
  selectedDate,
  onSelectDate,
  holidayDayOfWeek = 4 // Default Thursday
}) => {
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate calendar grid cells (42 cells: previous trailing, current month, next leading)
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 1 = Mon...
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  interface CalendarDay {
    dayNumber: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    isHoliday: boolean;
    isPast: boolean;
    isSelected: boolean;
    isToday: boolean;
    dateObj: Date;
  }

  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDayNum = daysInPrevMonth - i;
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateObj = new Date(prevYear, prevMonth, prevDayNum);
    dateObj.setHours(0, 0, 0, 0);

    const isHoliday = dateObj.getDay() === holidayDayOfWeek;
    const isPast = dateObj < today;
    const isSelected = 
      selectedDate.getFullYear() === prevYear &&
      selectedDate.getMonth() === prevMonth &&
      selectedDate.getDate() === prevDayNum;

    days.push({
      dayNumber: prevDayNum,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isHoliday,
      isPast,
      isSelected,
      isToday: false,
      dateObj
    });
  }

  // 2. Days of current month
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateObj = new Date(viewYear, viewMonth, d);
    dateObj.setHours(0, 0, 0, 0);

    const isHoliday = dateObj.getDay() === holidayDayOfWeek;
    const isPast = dateObj < today;
    const isToday = 
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === d;
    const isSelected = 
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === d;

    days.push({
      dayNumber: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
      isHoliday,
      isPast,
      isSelected,
      isToday,
      dateObj
    });
  }

  // 3. Leading days of next month to fill remaining grid cells up to 35 or 42
  const totalCells = days.length <= 35 ? 35 : 42;
  const remainingCells = totalCells - days.length;
  for (let n = 1; n <= remainingCells; n++) {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const dateObj = new Date(nextYear, nextMonth, n);
    dateObj.setHours(0, 0, 0, 0);

    const isHoliday = dateObj.getDay() === holidayDayOfWeek;
    const isPast = dateObj < today;
    const isSelected = 
      selectedDate.getFullYear() === nextYear &&
      selectedDate.getMonth() === nextMonth &&
      selectedDate.getDate() === n;

    days.push({
      dayNumber: n,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isHoliday,
      isPast,
      isSelected,
      isToday: false,
      dateObj
    });
  }

  const handleCellClick = (day: CalendarDay) => {
    if (day.isHoliday) {
      // Holiday is not selectable according to note
      return;
    }
    onSelectDate(day.dateObj);
  };

  const formattedDateHeader = selectedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-2">
      {/* Ready Target Date Input Display */}
      <div className="relative flex items-center bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs">
        <span className="flex-1 font-semibold text-slate-800">
          {formattedDateHeader}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {/* Embedded Calendar Widget Box */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs space-y-2 select-none">
        {/* Month Header Navigation */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 font-bold transition"
            title="Previous Month"
          >
            «
          </button>
          
          <span className="text-xs font-bold text-slate-900 tracking-tight">
            {monthNames[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 font-bold transition"
            title="Next Month"
          >
            »
          </button>
        </div>

        {/* Weekday Names Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-700 pt-0.5">
          <span className="text-slate-600">Sun</span>
          <span className="text-slate-600">Mon</span>
          <span className="text-slate-600">Tue</span>
          <span className="text-slate-600">Wed</span>
          <span className="text-slate-400">Thu</span>
          <span className="text-slate-600">Fri</span>
          <span className="text-slate-600">Sat</span>
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {days.map((day, idx) => {
            const isClickable = !day.isHoliday;

            let cellClasses = 'h-7 flex items-center justify-center rounded text-xs transition relative font-medium ';

            if (day.isSelected) {
              // Highlighted Selected Date (matches screenshot primary purple/indigo/blue)
              cellClasses += 'bg-indigo-600 text-white font-bold shadow-xs ';
            } else if (day.isHoliday) {
              // Holiday (Thursday) - muted / not selectable
              cellClasses += 'text-slate-300 cursor-not-allowed bg-slate-50/50 ';
            } else if (!day.isCurrentMonth) {
              // Trailing / leading days
              cellClasses += 'text-slate-300 hover:bg-slate-50 cursor-pointer ';
            } else if (day.isToday) {
              // Today indicator
              cellClasses += 'text-sky-700 font-bold bg-sky-50 border border-sky-200 hover:bg-sky-100 cursor-pointer ';
            } else {
              // Standard current month day
              cellClasses += 'text-slate-800 hover:bg-slate-100 cursor-pointer font-medium ';
            }

            return (
              <button
                key={`${day.year}-${day.month}-${day.dayNumber}-${idx}`}
                type="button"
                disabled={day.isHoliday}
                onClick={() => handleCellClick(day)}
                className={cellClasses}
              >
                <span>{day.dayNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Holiday Legend & Disclaimer Note */}
        <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[9px] text-slate-400">
              -
            </span>
            <span className="font-medium text-slate-600">Thursday (Holiday)</span>
          </div>
          <p className="text-[9.5px] text-slate-500 leading-tight">
            <span className="font-bold text-slate-600">Note:</span> Every Thursday is a holiday. It is not selectable.
          </p>
        </div>
      </div>
    </div>
  );
};
