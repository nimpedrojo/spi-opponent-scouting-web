import type { JSX } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { appNavigationItems } from '../../features/navigation/config/app-navigation';

export function AppShellLayout(): JSX.Element {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <span className="app-sidebar__eyebrow">ProcessIQ Sports</span>
          <h1>SPI Opponent Scouting</h1>
          <p>Flujos de analisis estructurado para inteligencia del rival.</p>
        </div>

        <nav aria-label="Navegacion principal" className="app-sidebar__nav">
          {appNavigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'app-sidebar__link app-sidebar__link--active'
                  : 'app-sidebar__link'
              }
            >
              <span>{item.label}</span>
              <small>{item.description}</small>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
