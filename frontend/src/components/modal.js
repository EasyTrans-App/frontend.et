// src/components/Modal.js
import { useEffect } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    // Agrega la clase de blur al body (o a un wrapper) mientras el modal esté abierto
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => document.body.classList.remove("modal-open");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-animate">
        <button className="modal-close-btn" onClick={onClose}>
          <i class="bi bi-x-circle" style={{color: 'red'}}></i>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
