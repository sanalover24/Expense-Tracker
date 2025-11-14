import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '../icons';
import { isSameDay } from '../../utils/date';

type FilterMode = 'month' | 'day' | 'range';
export type DateFilter = {
    mode: FilterMode;
    value: string | Date | { start: Date | null; end: Date | null } | null;
}

interface PremierDatePickerProps {
  value: DateFilter;
  onChange: (value: DateFilter) => void;
  allowRangeSelection?: boolean;
}

const isDateInRange = (date: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false;
    const time = new Date(date).setHours(0,0,0,0);
    const startTime = new Date(start).setHours(0,0,0,0);
    const endTime = new Date(end).setHours(0,0,0,0);
    return time >= startTime && time <= endTime;
};


const CalendarDropdown: React.FC<{
  displayDate: Date;
  setDisplayDate: React.Dispatch<React.SetStateAction<Date>>;
  value: DateFilter;
  handleDaySelect: (day: Date) => void;
  handleMonthSelect: (month: number) => void;
  allowRangeSelection: boolean;
  rangeStart: Date | null;
  hoveredDate: Date | null;
  setHoveredDate: React.Dispatch<React.SetStateAction<Date | null>>;
  onChange: (value: DateFilter) => void;
  setIsOpen: (isOpen: boolean) => void;
}> = ({
  displayDate,
  setDisplayDate,
  value,
  handleDaySelect,
  handleMonthSelect,
  allowRangeSelection,
  rangeStart,
  hoveredDate,
  setHoveredDate,
  onChange,
  setIsOpen,
}) => {
    const [view, setView] = useState<'days' | 'months'>('days');

    const calendarGrid = useMemo(() => {
        const month = displayDate.getMonth();
        const year = displayDate.getFullYear();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday is 0
        const grid = [];
        
        for (let i = firstDayIndex; i > 0; i--) {
            grid.push({ date: new Date(year, month, 1 - i), isPadding: true });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({ date: new Date(year, month, i), isPadding: false });
        }
        while (grid.length % 7 !== 0) {
            grid.push({ date: new Date(year, month + 1, grid.length - daysInMonth - firstDayIndex + 1), isPadding: true });
        }
        return grid;
    }, [displayDate]);

    const renderDaysView = () => (
        <>
            <div className="flex items-center justify-between p-2">
                <button type="button" onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeftIcon className="w-5 h-5" /></button>
                <button type="button" onClick={() => setView('months')} className="font-semibold text-lg p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                    {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </button>
                <button type="button" onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-slate-500 dark:text-slate-400 p-2 border-b dark:border-slate-700">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 p-2" onMouseLeave={() => setHoveredDate(null)}>
                {calendarGrid.map(({date, isPadding}, index) => {
                    const dayDate = date;
                    const isSelectedDay = value.mode === 'day' && value.value && isSameDay(dayDate, value.value as Date);
                    
                    let isStart = false, isEnd = false, isInRange = false, isSingleDaySelection = isSelectedDay;

                    if (allowRangeSelection) {
                      const effectiveRangeStart = rangeStart || (value.mode === 'range' ? (value.value as any)?.start : null);
                      const effectiveRangeEnd = (rangeStart ? hoveredDate : null) || (value.mode === 'range' ? (value.value as any)?.end : null);
                      
                      let start: Date | null = null;
                      let end: Date | null = null;

                      if (effectiveRangeStart && effectiveRangeEnd) {
                          start = effectiveRangeEnd < effectiveRangeStart ? effectiveRangeEnd : effectiveRangeStart;
                          end = effectiveRangeEnd < effectiveRangeStart ? effectiveRangeStart : effectiveRangeEnd;
                      } else if (effectiveRangeStart) {
                          start = effectiveRangeStart;
                      }
                      
                      isStart = start && isSameDay(dayDate, start);
                      isEnd = end && isSameDay(dayDate, end);
                      isInRange = start && end && !isStart && !isEnd && isDateInRange(dayDate, start, end);
                      isSingleDaySelection = isSingleDaySelection || (rangeStart && isSameDay(dayDate, rangeStart) && !hoveredDate) || (start && end && isSameDay(start, end) && isSameDay(dayDate, start));
                    }

                    const classes = [
                        'h-10 w-10 text-sm transition-colors',
                        isPadding ? 'text-slate-400 dark:text-slate-600 cursor-default' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                    ];
                    
                    if (isSingleDaySelection) {
                        classes.push('bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-full');
                    } else if (isStart) {
                        classes.push('bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-l-full rounded-r-none');
                    } else if (isEnd) {
                        classes.push('bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-r-full rounded-l-none');
                    } else if (isInRange) {
                        classes.push('bg-slate-100 dark:bg-slate-800 rounded-none');
                    } else {
                        classes.push('rounded-full');
                    }

                    return (
                        <button
                            key={index}
                            type="button"
                            disabled={isPadding}
                            onClick={() => handleDaySelect(dayDate)}
                            onMouseEnter={() => !isPadding && allowRangeSelection && setHoveredDate(dayDate)}
                            className={classes.join(' ')}
                        >
                            {dayDate.getDate()}
                        </button>
                    )
                })}
            </div>
            {allowRangeSelection && (
              <div className="p-2 border-t dark:border-slate-700">
                  <button 
                      type="button" 
                      className="w-full text-center p-2 rounded-md text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => {
                          onChange({ mode: 'month', value: `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}` });
                          setIsOpen(false);
                      }}
                  >
                      Select {displayDate.toLocaleString('default', { month: 'long' })}
                  </button>
              </div>
            )}
        </>
    );

    const renderMonthsView = () => (
        <>
            <div className="flex items-center justify-between p-2">
                <button type="button" onClick={() => setDisplayDate(d => new Date(d.getFullYear() - 1, d.getMonth(), 1))} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeftIcon className="w-5 h-5" /></button>
                <span className="font-semibold text-lg">{displayDate.getFullYear()}</span>
                <button type="button" onClick={() => setDisplayDate(d => new Date(d.getFullYear() + 1, d.getMonth(), 1))} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2 p-2">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => (
                    <button
                        key={month}
                        type="button"
                        onClick={() => {
                            handleMonthSelect(index);
                            setView('days');
                        }}
                        className="p-3 text-sm rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        {month}
                    </button>
                ))}
            </div>
        </>
    );

    return view === 'days' ? renderDaysView() : renderMonthsView();
}


const PremierDatePicker: React.FC<PremierDatePickerProps> = ({ value, onChange, allowRangeSelection = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const [displayDate, setDisplayDate] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleResize = () => setIsOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
      if (isOpen) {
          // Set initial display date when opening
          let initialDate = new Date();
          if (value.value) {
            try {
              if (value.mode === 'day' && value.value instanceof Date) initialDate = value.value;
              else if (value.mode === 'month') initialDate = new Date((value.value as string) + '-02');
              else if (value.mode === 'range' && (value.value as any)?.start) initialDate = (value.value as any).start;
            } catch(e) { /* use default */ }
          }
          setDisplayDate(initialDate);

          // Position the dropdown
          if (triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect();
              const CALENDAR_HEIGHT = allowRangeSelection ? 400 : 350;
              const spaceBelow = window.innerHeight - rect.bottom;
              const opensUp = spaceBelow < CALENDAR_HEIGHT && rect.top > CALENDAR_HEIGHT;

              setDropdownStyle({
                  position: 'absolute',
                  top: opensUp ? `${rect.top - CALENDAR_HEIGHT - 4}px` : `${rect.bottom + 4}px`,
                  left: `${rect.left}px`,
                  width: `${rect.width}px`,
                  minWidth: '320px',
                  transformOrigin: opensUp ? 'bottom' : 'top',
              });
          }

      } else {
        setRangeStart(null);
        setHoveredDate(null);
      }
  }, [isOpen, value, allowRangeSelection]);

  const handleDaySelect = (day: Date) => {
    if (allowRangeSelection) {
      if (!rangeStart) {
          setRangeStart(day);
      } else {
          let start = rangeStart;
          let end = day;
          if (end < start) [start, end] = [end, start];
          onChange(isSameDay(start, end) ? { mode: 'day', value: start } : { mode: 'range', value: { start, end } });
          setIsOpen(false);
      }
    } else {
      onChange({ mode: 'day', value: day });
      setIsOpen(false);
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    setDisplayDate(new Date(displayDate.getFullYear(), monthIndex, 1));
  };
  
  const getButtonLabel = () => {
    const { mode, value: filterValue } = value;
    if (!filterValue) return "Select Date";
    try {
        if (mode === 'month') {
            return new Date((filterValue as string) + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });
        }
        if (mode === 'day') {
            return (filterValue as Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'});
        }
        if (mode === 'range') {
            const { start, end } = filterValue as { start: Date | null, end: Date | null };
            if (start && end) {
                if (isSameDay(start, end)) {
                    return start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'});
                }
                const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                return `${startStr} - ${endStr}`;
            }
        }
    } catch(e) { return "Select Date"; }
    return "Select Date";
  }

  return (
    <div ref={triggerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-left bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-200 min-h-[42px]"
      >
        <span className="flex items-center">
          <CalendarIcon className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400" />
          <span className="text-slate-900 dark:text-slate-100">{getButtonLabel()}</span>
        </span>
        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
         <div 
            ref={dropdownRef}
            style={dropdownStyle}
            className={`
                z-50 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden
                ${dropdownStyle.transformOrigin === 'bottom' ? 'animate-fade-in-down' : 'animate-fade-in-up'}
            `}
         >
            <CalendarDropdown
              displayDate={displayDate}
              setDisplayDate={setDisplayDate}
              value={value}
              handleDaySelect={handleDaySelect}
              handleMonthSelect={handleMonthSelect}
              allowRangeSelection={allowRangeSelection}
              rangeStart={rangeStart}
              hoveredDate={hoveredDate}
              setHoveredDate={setHoveredDate}
              onChange={onChange}
              setIsOpen={setIsOpen}
            />
         </div>,
         document.body
      )}
    </div>
  );
};

export default PremierDatePicker;