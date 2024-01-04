import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { User } from '../types';
import styles from '../styles/PotentialFriends.module.css';

const PotentialFriends: React.FC = () => {
 const [users, setUsers] = useState<User[]>([]);
 const [searchTerm, setSearchTerm] = useState("");
 const auth = useAuth();

 useEffect(() => {
    const fetchUsers = async () => {
       if (auth.isAuthenticated && auth.token) {
          try {
             const usersList = await apiService.getUsers();
             setUsers(usersList);
          } catch (error) {
             console.error('Failed to fetch users:', error);
          }
       }
    };
    fetchUsers();
 }, [auth.isAuthenticated, auth.token]);

 const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const handleAddFriend = async (username: string) => {
    try {
       await apiService.sendFriendRequest(username);
       console.log('Friend request sent!');
    } catch (error) {
       console.error('Error sending friend request:', error);
    }
 };

 return (
    <div className={styles.potentialFriendsContainer}>
       <div className={styles.closeButton}></div>
       <input className={styles.search}
          type="text" 
          placeholder="Search friends" 
          value={searchTerm} 
          onChange={event => setSearchTerm(event.target.value)} 
       />
       {filteredUsers.map((user) => (
          <div key={user.id}>
             <p>{user.username}</p>
             <button className={styles.load} onClick={() => handleAddFriend(user.username)}>+</button>
          </div>
       ))}
    </div>
 );
};

export default PotentialFriends;