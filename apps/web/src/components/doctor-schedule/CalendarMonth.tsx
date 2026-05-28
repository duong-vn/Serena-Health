import { useState, useEffect } from 'react';
import { SCHEDULE_DATA } from '../../data/scheduleData';
import { FilterSelect } from '../ui/FilterSelect';
import './CalendarMonth.css';

interface CalendarMonthProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    className?: string;
}

const CalendarMonth = ({ selectedDate, onDateSelect, className }: CalendarMonthProps) => {
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Default to May 2026 (index 4)
    const [viewDate, setViewDate] = useState(new Date(2026, 4, 1));

    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Synchronize viewDate when selectedDate changes from outside (e.g. from tab selection or dashboard load)
    useEffect(() => {
        if (selectedDate) {
            const dateParts = selectedDate.split('-');
            if (dateParts.length === 3) {
                const year = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1; // Convert 1-12 to 0-11
                const day = parseInt(dateParts[2]);
                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    setViewDate(new Date(year, month, 1));
                }
            }
        }
    }, [selectedDate]);

    return (
        <div className={`calendar-container ${className || ''}`}>

            <div className="calendar-header">
                <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Lịch làm việc tháng</h2>
                <FilterSelect
                    value={currentMonth.toString()}
                    options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => ({
                        label: `Tháng ${m}`,
                        value: (m - 1).toString() // 0-indexed values
                    }))}
                    onChange={(e) => setViewDate(new Date(currentYear, parseInt(e.target.value), 1))}
                />
            </div>

            <div className="calendar-grid-header">
                {daysOfWeek.map(d => <div key={d} className="day-name">{d}</div>)}
            </div>

            <div className="calendar-grid">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="empty-cell"></div>
                ))}

                {daysArray.map(day => {
                    const dateObj = new Date(currentYear, currentMonth, day);
                    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

                    const dayShifts = SCHEDULE_DATA[dateStr] || [];
                    const hasWorkSchedule = dayShifts.length > 0;
                    const isSelected = selectedDate === dateStr;
                    const dayOfWeek = dateObj.getDay();
                    
                    // Check if any shift on this day has patients
                    const hasAppointments = dayShifts.some(shift => shift.patients && shift.patients.length > 0);

                    const todayObj = new Date();
                    const isToday = todayObj.getFullYear() === currentYear &&
                                    todayObj.getMonth() === currentMonth &&
                                    todayObj.getDate() === day;

                    return (
                        <div
                            key={day}
                            className={`calendar-day 
                                ${isSelected ? 'selected' : ''} 
                                ${isToday ? 'today' : ''} 
                                ${hasWorkSchedule ? 'has-schedule' : ''} 
                                ${(dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : ''}`
                            }
                            onClick={() => onDateSelect(dateStr)}
                        >
                            <span className="day-number">{day}</span>
                            {hasWorkSchedule && hasAppointments && <div className="event-dot"></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarMonth;