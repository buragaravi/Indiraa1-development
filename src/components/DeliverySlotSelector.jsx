import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiCheck, FiLoader } from 'react-icons/fi';

const DeliverySlotSelector = ({ 
  onSlotSelect, 
  loading = false, 
  initialDate = null, 
  initialTimeSlot = null 
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(initialTimeSlot);
  const [availableDates, setAvailableDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  // Generate available dates (minimum 2 days from today)
  useEffect(() => {
    const generateAvailableDates = () => {
      const dates = [];
      const today = new Date();
      
      // Start from 2 days from today
      for (let i = 2; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-IN', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          }),
          fullDate: date.toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        });
      }
      
      setAvailableDates(dates);
      setLoadingDates(false);
    };

    generateAvailableDates();
  }, []);

  // Fetch time slots when component mounts
  useEffect(() => {
    const fetchTimeSlots = async () => {
      setLoadingTimeSlots(true);
      try {
        const response = await fetch('http://localhost:5001/api/delivery-slots/time-slots', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Handle both array of strings and array of objects
          const slots = data.timeSlots || [];
          const processedSlots = slots.map(slot => {
            if (typeof slot === 'string') {
              return slot;
            } else if (slot && slot.value) {
              return slot.value; // Extract value from object
            } else {
              return slot.label || slot.toString();
            }
          });
          setTimeSlots(processedSlots);
        } else {
          // Fallback time slots if API fails
          setTimeSlots([
            '9:00 AM - 12:00 PM',
            '12:00 PM - 3:00 PM', 
            '3:00 PM - 6:00 PM',
            '6:00 PM - 9:00 PM'
          ]);
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        // Fallback time slots
        setTimeSlots([
          '9:00 AM - 12:00 PM',
          '12:00 PM - 3:00 PM', 
          '3:00 PM - 6:00 PM',
          '6:00 PM - 9:00 PM'
        ]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, []);

  const handleSave = () => {
    if (selectedDate && selectedTimeSlot && onSlotSelect) {
      onSlotSelect(selectedDate, selectedTimeSlot);
    }
  };

  const isFormValid = selectedDate && selectedTimeSlot;

  if (loadingDates) {
    return (
      <div className="flex justify-center items-center p-8">
        <FiLoader className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading available dates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <FiCalendar className="w-4 h-4 inline mr-2" />
          Select Delivery Date
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {availableDates.map((date, index) => (
            <motion.button
              key={`date-${index}-${date.value}`}
              type="button"
              onClick={() => setSelectedDate(date.value)}
              className={`p-3 text-left rounded-xl border-2 transition-all duration-200 ${
                selectedDate === date.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-medium">{date.label}</div>
              <div className="text-xs text-gray-500">{date.fullDate}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Time Slot Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <FiClock className="w-4 h-4 inline mr-2" />
          Select Time Slot
        </label>
        {loadingTimeSlots ? (
          <div className="flex justify-center items-center p-4">
            <FiLoader className="w-4 h-4 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading time slots...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {timeSlots.map((slot, index) => (
              <motion.button
                key={`timeslot-${index}-${slot}`}
                type="button"
                onClick={() => setSelectedTimeSlot(slot)}
                className={`p-3 text-left rounded-xl border-2 transition-all duration-200 ${
                  selectedTimeSlot === slot
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium">{slot}</div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        disabled={!isFormValid || loading}
        className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          isFormValid && !loading
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        whileHover={isFormValid && !loading ? { scale: 1.02 } : {}}
        whileTap={isFormValid && !loading ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <>
            <FiLoader className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <FiCheck className="w-4 h-4" />
            Save Delivery Preferences
          </>
        )}
      </motion.button>

      {/* Selected Summary */}
      {selectedDate && selectedTimeSlot && (
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-medium text-blue-800 mb-2">Selected Preferences:</h4>
          <div className="text-sm text-blue-700">
            <div>📅 Date: {availableDates.find(d => d.value === selectedDate)?.fullDate}</div>
            <div>🕐 Time: {selectedTimeSlot}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DeliverySlotSelector;
