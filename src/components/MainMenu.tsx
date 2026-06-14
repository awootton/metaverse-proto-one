
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';


// Menu.types.ts
export interface MenuItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface DropdownMenuProps {

  triggerLabel: React.ReactNode;
  items: MenuItem[];
}

// DropdownMenu.tsx
import React, { useState, useRef, useEffect } from "react";

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ triggerLabel, items }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Toggle dropdown visibility
  const toggleMenu = (): void => setIsOpen((prev) => !prev);

  // Close menu when clicking outside of the element
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown-container" ref={menuRef} style={
      {   position: "relative", 
          display: "inline-block"}
      }>
      {/* <button 
        className="dropdown-trigger" 
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {triggerLabel} {isOpen ? "▲" : "▼"}
      </button> */}

      <MoreHorizIcon onClick={toggleMenu} style={{ cursor: "pointer" }} />

      {isOpen && (
        <ul 
          className="dropdown-menu" 
          role="menu"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            listStyle: "none",
            padding: "8px 0",
            margin: "4px 0 0 0",
            minWidth: "160px",
            zIndex: 1000,
            borderRadius: "4px"
          }}
        >
          {items.map((item) => (
            <li key={item.id} role="none">
              <button
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false); // Auto-close on selection
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: "8px 16px",
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  opacity: item.disabled ? 0.5 : 1,
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

