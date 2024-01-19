import React from 'react';
import { User } from '../types';
import styles from '../styles/FriendProfile.module.css'

interface FriendProfileProps {
  friend: User;
  onClose: () => void;
}

const FriendProfile: React.FC<FriendProfileProps> = ({ friend, onClose }) => {
    return (
      <div className={styles.container}>
        <button className={styles.closeButton} onClick={onClose}>x</button>
        <p>Username: {friend.username}</p>
        <p>Display Name: {friend.display_name}</p>
        <p>Wins: {friend.wins}</p>
        <p>Losses: {friend.losses}</p>
        <p>Status: {friend.status}</p>
      </div>
    );
   };

export default FriendProfile;
