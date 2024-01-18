// import React, { useEffect, useState } from 'react';
// // import { useParams } from 'react-router-dom';
// import apiService from '../services/apiService';
// import { User } from '../types';

// interface FriendProfileProps {
//  userId: string;
// }

// const FriendProfile: React.FC<FriendProfileProps> = ({ userId }) => {
//  const [profile, setProfile] = useState<User | null>(null);

//  useEffect(() => {
//     if (!userId) {
//         console.error('FriendProfile: User ID is undefined');
//         return;
//     }
//     const fetchFriendProfile = async () => {
//         try {
//             const friendProfile = await apiService.getUserById(userId);
//             setProfile(friendProfile);
//         } catch (error) {
//             console.error('Failed to fetch friend profile:', error);
//         }
//     };
//     fetchFriendProfile();
// }, [userId]);


//  if (!profile) {
//    return <div>Loading...</div>;
//  }

//  return (
//    <div>
//      <p>Username: {profile.username}</p>
//      <p>Display Name: {profile.display_name}</p>
//      <p>Wins: {profile.wins}</p>
//      <p>Losses: {profile.losses}</p>
//      <p>Status: {profile.status}</p>
//    </div>
//  );
// };

// export default FriendProfile;

import React from 'react';
import { User } from '../types';

interface FriendProfileProps {
  friend: User;
}

const FriendProfile: React.FC<FriendProfileProps> = ({ friend }) => {
  return (
    <div>
      <p>Username: {friend.username}</p>
      <p>Display Name: {friend.display_name}</p>
      <p>Wins: {friend.wins}</p>
      <p>Losses: {friend.losses}</p>
      <p>Status: {friend.status}</p>
    </div>
  );
};

export default FriendProfile;
