import { useEffect, useState } from "react";
import * as api from "./services/apiService";
import m7Logo from "/Logo-black.png";
import "./App.css";
import NursePreferences from "./components/NursePreferences";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from "papaparse";

function App() {
  const [nurses, setNurses] = useState<unknown[] | null>(null);
  const [requirements, setRequirements] = useState<unknown[] | null>(null);
  const [schedules, setSchedules] = useState<unknown[] | null>(null);
  const [activeTab, setActiveTab] = useState("preferences");
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const fetchNurses = async () => {
      const nurses = await api.default.getNurses(); // TODO: this appears to be getting called twice on page load... why?
      setNurses(nurses);
    };

    fetchNurses().catch(console.error);
  }, []);

  useEffect(() => {
    const fetchRequirements = async () => {
      const requirements = await api.default.getShiftRequirements();
      setRequirements(requirements);
    };

    fetchRequirements().catch(console.error);
  }, []);

  // I just did the logic for generating schedule in App.tsx for time purposes
  // instead of using ScheduleDetails.tsx
  const handleGenerateSchedule = async () => {
    const startDate = new Date().toISOString(); // can customize if needed
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // one week later
  
    const schedule = await api.default.generateSchedule(startDate, endDate);
    setSchedules(schedule);
    toast.success("Schedule successfully generated for the current week.");
    setActiveTab("schedule");
  };

  const handleDownloadCSV = () => {
    if (!schedules) return;

    // Prepare an array of objects for cleaner CSV headers
    const csvData = schedules.map((entry: any) => ({
      Day: entry.day,
      Shift: entry.shift,
      Nurse: entry.nurse,
    }));

    const csv = Papa.unparse(csvData);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "schedule.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div>
        <a href="https://m7health.com" target="_blank">
          <img src={m7Logo} className="logo" alt="M7 Health logo" />
        </a>
      </div>
      <ToastContainer autoClose={3000} />
      <h1>M7 Health scheduling exercise</h1>
      <div className="card">
        Check the README for guidance on how to complete this exercise. Find
        inspiration{" "}
        <a href="https://www.m7health.com/#product" target="_blank">
          on M7's site
        </a>
        .
      </div>
      {/* manual inline styles for the buttons */}
      <div className="tab-buttons" style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
        <button
          onClick={() => setActiveTab("preferences")}
          style={{
            borderRadius: "9999px",
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "preferences" ? "rgb(95, 92, 153)" : "#f3f3f3",
            color: activeTab === "preferences" ? "#fff" : "#333",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Nurse Preferences
        </button>
        <button
          onClick={() => setActiveTab("requirements")}
          style={{
            borderRadius: "9999px",
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "requirements" ? "rgb(95, 92, 153)" : "#f3f3f3",
            color: activeTab === "requirements" ? "#fff" : "#333",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Shift Requirements
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          style={{
            borderRadius: "9999px",
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "schedule" ? "rgb(95, 92, 153)" : "#f3f3f3",
            color: activeTab === "schedule" ? "#fff" : "#333",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Current Schedule
        </button>
      </div>

      {activeTab === "preferences" && (
        <div className="card">
          <h2>Nurse Preferences</h2>
          <p>Click your name to view and submit your preferred shifts for the week.</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {nurses &&
                nurses.map((nurse: any) => (
                  <tr key={nurse.id}>
                    <td>
                      <NursePreferences
                        id={nurse.id}
                        name={nurse.name}
                        days={days}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "requirements" && (
        <div className="card">
          <h2>Shift Requirements</h2>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Shift</th>
                <th>Nurses required</th>
              </tr>
            </thead>
            <tbody>
              {requirements &&
                requirements.map((req: any) => (
                  <tr key={req.dayOfWeek + "-" + req.shift}>
                    <td>{req.dayOfWeek}</td>
                    <td>{req.shift}</td>
                    <td>{req.nursesRequired}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="card">
          <h2>Current Schedule</h2>
          {/* generate the schedule only on button click and make sure the rows that meet requirements are green
          if not they are red */}
          <button onClick={handleGenerateSchedule}>Generate Current Week's Schedule</button>
          {schedules && (
            <>
              <button onClick={handleDownloadCSV} style={{ marginLeft: "1rem" }}>
                Download CSV
              </button>
              <div style={{ marginBottom: "1rem" }}></div>
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Shift</th>
                    <th>Assigned Nurses</th>
                    <th>Shift Requirements Met</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements &&
                    requirements.map((req: any) => {
                      const matchingEntries = schedules.filter(
                        (entry: any) =>
                          entry.day === req.dayOfWeek && entry.shift === req.shift
                      );
                      const assignedNurses = matchingEntries.map(
                        (entry: any) => entry.nurse
                      );
                      const metRequirement =
                        assignedNurses.length >= parseInt(req.nursesRequired, 10);

                      return (
                        <tr
                          key={`${req.dayOfWeek}-${req.shift}`}
                          style={{
                            backgroundColor: metRequirement ? "#e6ffed" : "transparent",
                          }}
                        >
                          <td>{req.dayOfWeek}</td>
                          <td>{req.shift}</td>
                          <td>{assignedNurses.join(", ")}</td>
                          <td>{metRequirement ? "✅" : "❌"}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default App;
