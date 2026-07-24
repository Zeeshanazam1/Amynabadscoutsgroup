import { useEffect, useState, useMemo } from 'react';
import eventsData from '../data/events.json';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const CountdownBox = ({ value, label }) => (
  <div className="text-center">
    <div className="text-4xl font-bold text-white">{value}</div>
    <div className="text-white/80 mt-1 text-sm font-semibold">{label}</div>
  </div>
);

export default function CountdownTimer() {
  const [countdown, setCountdown] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);

  const sortedEvents = useMemo(() => {
    return [...eventsData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, []);

  useEffect(() => {
    const findNextEvent = () => {
      const now = new Date();
      const upcomingEvents = sortedEvents.filter(
        (event) => new Date(event.date) > now
      );
      return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
    };

    const updateCountdown = () => {
      const next = findNextEvent();
      setNextEvent(next);

      if (!next) {
        setCountdown(null);
        return;
      }

      const eventDate = new Date(next.date);
      const now = new Date();
      const diff = eventDate - now;

      if (diff <= 0) {
        setCountdown(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [sortedEvents]);

  if (!nextEvent || !countdown) {
    return (
      <div className="bg-gradient-to-r from-slate-800 to-green-800 rounded-lg p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">No Upcoming Events</h3>
        <p className="text-gray-200">Check back soon for new event announcements!</p>
      </div>
    );
  }




  return (
    <div className="space-y-6">
      {/* Event Details */}
      <div className="bg-gradient-to-br from-green-50 to-slate-50 rounded-lg p-6 border-2 border-green-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-4">
          🎯 Next Event
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📌</span>
            <div>
              <p className="text-sm text-slate-600">Event</p>
              <p className="text-xl font-bold text-slate-800">
                {nextEvent.title}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-slate-700">
            <Calendar size={20} className="text-green-600" />
            <span className="font-semibold">
              {new Date(nextEvent.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-slate-700">
            <Clock size={20} className="text-green-600" />
            <span className="font-semibold">
              {new Date(nextEvent.date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-slate-700">
            <MapPin size={20} className="text-green-600" />
            <span className="font-semibold">{nextEvent.location}</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-700">
            <Users size={20} className="text-green-600" />
            <span className="font-semibold">{nextEvent.attendees}</span>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-gradient-to-r from-slate-800 via-green-800 to-slate-800 rounded-lg p-8 shadow-lg">
        <h3 className="text-center text-white text-xl font-bold mb-6">
          ⏳ Countdown to Event
        </h3>
        <div className="flex justify-around items-end">
          <CountdownBox value={countdown.days} label="Days" />
          <div className="text-white text-3xl font-bold">:</div>
          <CountdownBox value={countdown.hours} label="Hours" />
          <div className="text-white text-3xl font-bold">:</div>
          <CountdownBox value={countdown.minutes} label="Minutes" />
          <div className="text-white text-3xl font-bold">:</div>
          <CountdownBox value={countdown.seconds} label="Seconds" />
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg p-6 border-l-4 border-green-600 shadow-md">
        <p className="text-slate-700 leading-relaxed">
          {nextEvent.description}
        </p>
        <div className="mt-4 inline-block">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">
            {nextEvent.category}
          </span>
        </div>
      </div>
    </div>
  );
}
