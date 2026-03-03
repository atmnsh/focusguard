import { useState, useEffect, type ChangeEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./Timer.css";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";


export const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formatTime = (time: number) => {
    return time.toString().padStart(2, "0");
  };

  useEffect(() => {
    invoke('set_timer_state', { isRunning }).catch(console.error);
  }, [isRunning]);

  useEffect(() => {
    let timer: number | undefined;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]); // Только эти зависимости

  // Обработчики для input
  const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10) || 0;
    const newHours = Math.max(0, value);
    const currentSeconds = timeLeft % 3600;
    setTimeLeft(newHours * 3600 + currentSeconds);
  };

  const handleMinutesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10) || 0;
    const newMinutes = Math.max(0, Math.min(59, value));
    const currentHours = Math.floor(timeLeft / 3600);
    const currentSeconds = timeLeft % 60;
    setTimeLeft(currentHours * 3600 + newMinutes * 60 + currentSeconds);
  };

  const handleSecondsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10) || 0;
    const newSeconds = Math.max(0, Math.min(59, value));
    const hoursAndMinutes = Math.floor(timeLeft / 60) * 60;
    setTimeLeft(hoursAndMinutes + newSeconds);
  };

  const handleStartPause = () => {
    if (timeLeft === 0) return;

    if (isRunning) {
      setIsRunning(false);
    } else {
      setIsRunning(true);
      setIsFinished(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(0);
  };

  const timerClass = `
    timer-container 
    ${isRunning ? "timer-running" : ""} 
    ${isFinished ? "timer-finished" : ""}
  `;

  return (
    <div className="bg-white dark:bg-accent">
      <div className={timerClass}>


        <div className={`time-input-section ${isRunning ? "div-hidden" : ""}`}>
          <div className="time-input-group">
            <Label className="time-input-label">Часове</Label>
            <Input
              type="number"
              min="0"
              value={hours}
              onChange={handleHoursChange}
              className="time-input"
              disabled={isRunning}
            />
          </div>

          <span className="time-separator">:</span>

          <div className="time-input-group">
            <Label className="time-input-label">Минути</Label>
            <Input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={handleMinutesChange}
              className="time-input"
              disabled={isRunning}
            />
          </div>

          <span className="time-separator">:</span>

          <div className="time-input-group">
            <Label className="time-input-label">Секунди</Label>
            <Input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={handleSecondsChange}
              className="time-input"
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="timer-main-display">
          <div
            className={`timer-running-display ${!isRunning ? "div-hidden" : ""}`}
          >
            <div className="timer-display-label">Оставащо време</div>
            <div className="timer-running-time">
              {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
            </div>
          </div>
        </div>

        <div
          className={`timer-controls ${!isRunning ? "timer-controls-hidden" : ""}`}
        >
          <Button
            className={`timer-button ${isRunning ? "timer-button-pause" : "timer-button-start"}`}
            onClick={handleStartPause}
            disabled={timeLeft === 0 && !isRunning}
          >
            {isRunning ? "Пауза" : "Старт"}
          </Button>

          <Button
            className="timer-button timer-button-reset"
            onClick={handleReset}
            disabled={timeLeft === 0 && !isRunning && !isFinished}
          >
            Нулиране
          </Button>
        </div>
      </div>
    </div>
  );
};
