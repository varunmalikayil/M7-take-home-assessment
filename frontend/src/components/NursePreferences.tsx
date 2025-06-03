import React, { useEffect, useState } from "react";
import * as api from "../services/apiService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NursePreferences = ({ id, name, days }) => {
  // state for show depending on button click on the nurse itself to show details page
  const [showNursePreferredShifts, setShowNursePreferredShifts] =
    useState(false);
  // preferred shifts represents nurse preferences for the week in a format that makes it easy to render
  // and they can choose to prefer both the day and night shift now so doing it like this instead of a string
  const [nursePreferredShifts, setNursePreferredShifts] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const shifts = ["day", "night"];

  const handleClick = () => {
    setShowNursePreferredShifts((show) => !show);
  };

  const handleSubmitPreferences = (event) => {
    const setPreferences = async () => {
      const shiftsToPost = [];
      let totalShiftsSelected = 0;

      // loop through each day and collect selected shifts
      for (const day of days) {
        const selectedShifts = nursePreferredShifts[day] || [];
        if (selectedShifts.length > 0) {
          shiftsToPost.push({ dayOfWeek: day, shifts: selectedShifts });
          totalShiftsSelected += selectedShifts.length;
        }
      }
      // frontend validation
      if (totalShiftsSelected > 0 && totalShiftsSelected < 3) {
        toast.error("Please select at least 3 preferred shifts for the week if submitting any preferences.");
        return;
      }

      try {
        await api.default.setNursePreferences(id, shiftsToPost);
        toast.success(`Preferences submitted for ${name}`);
      } catch (err) {
        toast.error("Failed to submit preferences: " + (err.response?.data?.message || err.message));
      }
    };
    event.preventDefault();
    setPreferences().catch(console.error);
  };

// when mounting and any dependencies change
useEffect(() => {
  const fetchPreferences = async () => {
    // get the preferences for this nurse from the backend API
    let nursePreferences = await api.default.getNursePreferences(id);

    if (!nursePreferences) {
      nursePreferences = [];
    }
    const newPreferredShifts = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    // looping through the nurse's preferences for each day
    nursePreferences.forEach((nursePreference) => {
      const day = nursePreference.dayOfWeek;
      const shifts = nursePreference.shifts || [];
      newPreferredShifts[day] = shifts;
    });

    // updating state
    setNursePreferredShifts(newPreferredShifts);
  };

  fetchPreferences().catch(console.error);
}, [id]);

  // changing the preferredShifts in the page depending on the checkboxes
  const handleChange = (event) => {
    // quick rename of the event.target properties
    const { name: day, value: shiftType, checked: isChecked } = event.target;

    setNursePreferredShifts((prevShifts) => {
      // copying old shifts so we don’t change original
      const newShifts = JSON.parse(JSON.stringify(prevShifts));
      let current = newShifts[day] || [];
    
      // Add or remove the selected shift
      if (isChecked) {
        if (!current.includes(shiftType)) {
          current.push(shiftType);
        }
      } else {
        // remove the shift from the list, filter is handy for that
        current = current.filter((s) => s !== shiftType);
      }
    
      // Update the shifts for that specific day
      newShifts[day] = current;
      return newShifts;
    });
  };

  return (
    <div>
      <button onClick={handleClick}>{name}</button>
      {showNursePreferredShifts && (
        <div>
          Pick at least 3 preferred shifts for the week:
          <form onSubmit={handleSubmitPreferences}>
            <table className="nurse-preferences">
              <thead>
                <tr>
                  <th>Day of the Week:</th>
                  <th>Type of Shift:</th>
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={"preference for " + day + " nurse with id " + id}>
                    <td>{day}</td>
                    <td>
                      <input
                        type="checkbox"
                        name={day}
                        value={shifts[0]}
                        checked={nursePreferredShifts[day].includes(shifts[0])}
                        onChange={handleChange}
                      />
                      <label htmlFor={shifts[0]} style={{ marginRight: "5px" }}>
                        {shifts[0]}
                      </label>
                      <input
                        type="checkbox"
                        name={day}
                        value={shifts[1]}
                        checked={nursePreferredShifts[day].includes(shifts[1])}
                        onChange={handleChange}
                      />
                      <label htmlFor={shifts[1]}>{shifts[1]}</label>
                      <br />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <input type="submit" name="submit" value="Submit" />
          </form>
        </div>
      )}
    </div>
  );
};

export default NursePreferences;
