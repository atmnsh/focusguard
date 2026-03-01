import { TextInput } from "@gravity-ui/uikit";
//import { Sidebar } from "../components/Sidebar";
import { Timer } from "../components/Timer";
import "./Focus.css";
//import { useState } from "react";

export const Focus = () => {
  return (
    <div className="focus-container">
      <div className="focus-content">
        <div className="focus-card">
          <div className="focus-header">
            <p className="focus-title">Фокус режим</p>
            <p className="focus-subtitle">
              Настройте дейност и таймер за максимална продуктивност. Работете
              концентрирано без разсейване.
            </p>
          </div>

          <div className="activity-section">
            <label className="section-label">Дейност</label>
            <p className="section-description">Въведете дейността си:</p>
            <TextInput
              placeholder="Например: Програмиране, Четене, Спорт, Учене..."
              className="activity-input"
              size="xl"
            />
          </div>

          <div className="timer-section">
            <label className="section-label">Таймер</label>
            <p className="section-description">
              Установете интервал за фокусиране:
            </p>
            <div className="timer-wrapper">
              <Timer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
