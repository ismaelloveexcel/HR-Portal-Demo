import React from "react";
export const SideMenu: React.FC<{ onNav: (key: string) => void; contactHref?: string; active?: string; }> = ({ onNav, contactHref="https://wa.me/971564966546", active }) => {
  const items = [
    { key: "documents", label: "Documents" },
    { key: "calendar", label: "Calendar" },
    { key: "inbox", label: "Inbox" },
    { key: "feedback", label: "Feedback" },
    { key: "contact", label: "Contact HR", href: contactHref },
    { key: "policies", label: "Policies" },
    { key: "templates", label: "Templates" },
    { key: "attendance", label: "Attendance" },
    { key: "pipeline", label: "Pipeline" },
  ];
  return (
    <nav style={{ borderRight: "1px solid #e5e7eb", paddingRight: 12, minWidth: 140 }}>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map(it => (
          <li key={it.key} style={{ marginBottom: 10 }}>
            {it.href ? (
              <a href={it.href} target="_blank" rel="noreferrer" style={{ color: "#0F3D91", fontWeight: 600, textDecoration: "none" }}>
                {it.label}
              </a>
            ) : (
              <button onClick={() => onNav(it.key)} style={{
                background: active === it.key ? "#0F3D91" : "#fff",
                color: active === it.key ? "#fff" : "#0F3D91",
                border: "1px solid #0F3D91",
                borderRadius: 6, padding: "6px 10px", width: "100%", fontWeight: 600, cursor: "pointer"
              }}>{it.label}</button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};