export const validateShowForm = (formData) => {
  const errors = {};

  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Show name is required';
  }

  if (!formData.start_time) {
    errors.start_time = 'Start time is required';
  }

  if (!formData.total_seats) {
    errors.total_seats = 'Total seats is required';
  } else if (formData.total_seats < 1) {
    errors.total_seats = 'Total seats must be at least 1';
  } else if (formData.total_seats > 200) {
    errors.total_seats = 'Total seats cannot exceed 200';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateSeatSelection = (selectedSeats, maxSeats = 10) => {
  if (selectedSeats.length === 0) {
    return {
      isValid: false,
      error: 'Please select at least one seat'
    };
  }

  if (selectedSeats.length > maxSeats) {
    return {
      isValid: false,
      error: `You can only book up to ${maxSeats} seats at once`
    };
  }

  return { isValid: true };
};
