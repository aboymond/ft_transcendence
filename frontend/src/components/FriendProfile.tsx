import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../services/apiService';
import { User } from '../types';

const FriendProfile: React.FC = () => {
 const [profile, setProfile] = useState<User | null>(null);
 const { id } = useParams<{ id: string }>();

 useEffect(() => {
   const fetchFriendProfile = async () => {
     if (id) {
       try {
         const friendProfile = await apiService.getUserById(id);
         setProfile(friendProfile);
       } catch (error) {
         console.error('Failed to fetch friend profile:', error);
       }
     }
   };
   fetchFriendProfile();
 }, [id]);

 if (!profile) {
   return <div>Loading...</div>;
 }

 return (
   <div>
     <p>Username: {profile.username}</p>
     <p>Display Name: {profile.display_name}</p>
     <p>Wins: {profile.wins}</p>
     <p>Losses: {profile.losses}</p>
     <p>Status: {profile.status}</p>
   </div>
 );
};

export default FriendProfile;