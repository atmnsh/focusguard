import { TextInput, Button } from "@gravity-ui/uikit";
import { Sidebar } from "../components/Sidebar";
import { Timer } from "../components/Timer";
import "./Focus.css";
import React, { useState } from "react";

export const Focus = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="focus-container">
      {/* Кнопка меню для мобильных */}
      <button
        className="sidebar-mobile-toggle"
        onClick={toggleMobileMenu}
        aria-label="Открыть меню"
      >
        ☰ Меню
      </button>

      {/* Мобильное меню */}
      <div
        className={`sidebar-mobile-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
      />

      <div className={`sidebar-mobile ${mobileMenuOpen ? "active" : ""}`}>
        <Sidebar />
      </div>

      {/* Десктопный сайдбар */}
      <div className="sidebar-desktop">
        <Sidebar />
      </div>

      {/* Основной контент */}
      <div className="focus-content">
        <div className="focus-card">
          {/* Заголовок страницы */}
          <div className="focus-header">
            <p className="focus-title">Фокус режим</p>
            <p className="focus-subtitle">
              Настройте дейност и таймер за максимална продуктивност. Работете
              концентрирано без разсейване.
            </p>
          </div>

          {/* Секция занятия */}
          <div className="activity-section">
            <label className="section-label">Дейност</label>
            <p className="section-description">Въведете дейността си:</p>
            <TextInput
              placeholder="Например: Програмиране, Четене, Спорт, Учене..."
              className="activity-input"
              size="xl"
            />
          </div>

          {/* Секция таймера */}
          <div className="timer-section">
            <label className="section-label">Таймер</label>
            <p className="section-description">
              Установете интервал за фокусиране:
            </p>
            <div className="timer-wrapper">
              <Timer />
            </div>
          </div>

          {/* Секция кнопок 
          <div className="actions-section">
            <Button view="action" size="xl" className="save-button">
              Запази
            </Button>
            <Button view="outlined" size="xl" className="remove-button">
              Премахни
            </Button>
          </div>*/}
        </div>
      </div>
    </div>
  );
};
