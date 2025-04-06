import React from 'react';
import './StatusBadge.css';

type OrderStatus =
  | 'Pending'
  | 'Allocated'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

interface StatusBadgeProps {
  status: OrderStatus;
}

/**
 * Reusable status badge component for displaying order status
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {status}
    </span>
  );
}
