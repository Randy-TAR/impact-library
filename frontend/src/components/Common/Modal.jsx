import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal as BootstrapModal, Button } from 'react-bootstrap';

const Modal = ({ isOpen, onClose, title, children, size = 'lg', showCloseButton = true }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl'
  };

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      role="dialog"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050
      }}
    >
      <div className={`modal-dialog modal-${sizeMap[size]} modal-dialog-centered modal-dialog-scrollable`}>
        <div className="modal-content shadow-lg border-0 rounded-3">
          
          {/* Modal Header */}
          <div className="modal-header border-bottom-0 pb-0">
            <div className="d-flex justify-content-between align-items-center w-100">
              <h5 className="modal-title fw-bold text-dark">
                {title}
              </h5>
              {showCloseButton && (
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              )}
            </div>
          </div>
          
          {/* Modal Body */}
          <div className="modal-body pt-2">
            {children}
          </div>
          
          {/* Modal Footer (Optional - can be hidden if not needed) */}
          {!children.props?.hideFooter && (
            <div className="modal-footer border-top-0 pt-0">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;