import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { useTodoStore } from '../store';

const Calendar: React.FC = () => {
  const { calendarEvents, tasks } = useTodoStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventsForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const events = calendarEvents.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= dayStart && eventStart <= dayEnd;
    });

    const tasksWithDates = tasks.filter(task => {
      if (!task.dueAt || task.status === 'done') return false;
      const taskDue = new Date(task.dueAt);
      return taskDue >= dayStart && taskDue <= dayEnd;
    });

    return { events, tasks: tasksWithDates };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelectedDate = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const days = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : { events: [], tasks: [] };

  return (
    <div className="h-full p-1 sm:p-3 lg:p-6 max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mx-0.5 sm:mx-0">
          {/* Calendar Header */}
          <div className="p-2 sm:p-4 lg:p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-xl font-semibold text-neutral-900">Calendar</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToToday}
                  className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
                >
                  Today
                </button>
                <button className="px-2 py-1.5 sm:px-3 lg:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1 flex-shrink-0">
                  <Plus size={14} />
                  <span className="text-xs sm:text-sm">New</span>
                </button>
              </div>
            </div>
            
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <h3 className="text-sm sm:text-lg font-semibold text-neutral-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-1.5 sm:p-3 lg:p-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-1 text-center text-[10px] sm:text-sm font-medium text-neutral-500">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day, index) => {
                const { events, tasks: dayTasks } = getEventsForDay(day);
                const hasItems = events.length > 0 || dayTasks.length > 0;
                
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[40px] sm:min-h-[80px] lg:min-h-[100px] p-0.5 sm:p-2 border border-neutral-100 rounded cursor-pointer transition-colors ${
                      isCurrentMonth(day) ? 'bg-white hover:bg-neutral-50' : 'bg-neutral-50'
                    } ${isToday(day) ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''} ${
                      isSelectedDate(day) ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                    }`}
                  >
                    <div className={`text-[10px] sm:text-xs font-medium mb-0.5 ${
                      isToday(day) ? 'text-indigo-600' : 
                      isCurrentMonth(day) ? 'text-neutral-900' : 'text-neutral-400'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {hasItems && (
                      <div className="space-y-0.5 overflow-hidden">
                        {/* Calendar events */}
                        {events.slice(0, 1).map(event => (
                          <div
                            key={event.id}
                            className="text-[7px] sm:text-[9px] lg:text-xs p-0.5 bg-blue-100 text-blue-800 rounded truncate"
                            title={event.title}
                          >
                            <div className="truncate">{event.title}</div>
                          </div>
                        ))}
                        
                        {/* Tasks */}
                        {dayTasks.slice(0, 1).map(task => (
                          <div
                            key={task.id}
                            className="text-[7px] sm:text-[9px] lg:text-xs p-0.5 bg-orange-100 text-orange-800 rounded truncate"
                            title={task.title}
                          >
                            <div className="truncate">{task.title}</div>
                          </div>
                        ))}
                        
                        {/* Show count if more items */}
                        {(events.length + dayTasks.length) > 1 && (
                          <div className="text-[6px] sm:text-[8px] text-neutral-500 text-center">
                            +{(events.length + dayTasks.length) - 1}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Events */}
          {selectedDate && (
            <div className="border-t border-neutral-200 p-2 sm:p-4 lg:p-6">
              <h3 className="text-sm sm:text-lg font-semibold text-neutral-900 mb-3">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              
              {selectedDayEvents.events.length === 0 && selectedDayEvents.tasks.length === 0 ? (
                <div className="text-center py-6">
                  <CalendarIcon size={24} className="mx-auto text-neutral-300 mb-2" />
                  <p className="text-xs sm:text-sm text-neutral-500">No events or tasks for this day</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Calendar events */}
                  {selectedDayEvents.events.map((event) => (
                    <div key={event.id} className="flex items-start space-x-2 p-2 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-neutral-900">{event.title}</h4>
                        <div className="flex items-center space-x-1 text-[10px] sm:text-xs text-neutral-600 mt-0.5">
                          <Clock size={12} />
                          <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
                          {event.location && (
                            <>
                              <MapPin size={12} />
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button className="p-0.5 text-neutral-400 hover:text-neutral-600 transition-colors">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Tasks */}
                  {selectedDayEvents.tasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-2 p-2 bg-orange-50 rounded-lg">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full flex-shrink-0 mt-1"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-neutral-900">{task.title}</h4>
                        <div className="flex items-center space-x-1 text-[10px] sm:text-xs text-neutral-600 mt-0.5">
                          <Clock size={12} />
                          <span>Due {formatTime(task.dueAt!)}</span>
                        </div>
                        {task.category && (
                          <p className="text-[10px] sm:text-xs text-neutral-600 mt-0.5">{task.category}</p>
                        )}
                      </div>
                      <button className="p-0.5 text-neutral-400 hover:text-neutral-600 transition-colors">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;