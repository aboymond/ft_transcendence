import React, { useContext } from 'react';
import { WebSocketContext } from './WebSocketHandler';
import styles from '../styles/BarNav.module.css';

const FriendRequestNotification: React.FC = () => {
  const webSocketContext = useContext(WebSocketContext);
  const pendingRequests = Number(webSocketContext?.userStatus?.pending_requests) ||  0;

  console.log('Pending Requests:', pendingRequests);

  return (
    <div className={styles.notification}>
      {pendingRequests >   0 && (
        <span className={styles.badge}>{pendingRequests}</span>
      )}
    </div>
  );
};

export default FriendRequestNotification;