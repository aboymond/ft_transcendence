import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import styles from '../styles/Window.module.css';
import GameHistoryList from './GameHistoryList';
import PotentialFriends from './PotentialFriends';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types';
import FriendProfile from './FriendProfile';
import { useEffect } from 'react';

enum Mode {
 FRIENDS,
 HISTORY
}

const Window: React.FC = () => {
 const [showContent, setShowContent] = useState(Mode.HISTORY);
 const handleButtonClick = (content: any) => {setShowContent(content)};
 const [selectedFriend, setSelectedFriend] = useState<User | null>(null);

 const [friends, setFriends] = useState<User[]>([]);
 const auth = useAuth();

 useEffect(() => {
   const fetchFriends = async () => {
     if (auth.isAuthenticated && auth.token) {
       try {
         const friendsList = await apiService.getFriends();
         setFriends(friendsList);
       } catch (error) {
         console.error('Failed to fetch friends:', error);
       }
     }
   };
   fetchFriends();
 }, [auth.isAuthenticated, auth.token]);

 const handleFriendSelect = (friend: User) => {
   setSelectedFriend(friend);
 };

 return (
   <Container className={styles.window}>
     <Row className={styles.row}>
       <Col className={styles.col}> 
         <Button 
           variant="primary"
           type="submit"
           className={styles.button}
           onClick={() => handleButtonClick(Mode.HISTORY)}
         >
           History
         </Button>
       </Col>
       <Col className={styles.col}>
         <Button 
           variant="primary"
           type="submit"
           className={styles.button}
           onClick={() => handleButtonClick(Mode.FRIENDS)}
         >
           Friends
         </Button>
       </Col>
       <Container className={styles.cont_window}>
         {showContent === Mode.HISTORY && (
           <Col className={styles.fullWindowContent}>
             <GameHistoryList />
           </Col>
         )}
         {showContent === Mode.FRIENDS && (
           <Col className={styles.fullWindowContent}>
             {selectedFriend ? (
               <FriendProfile friend={selectedFriend} onClose={() => setSelectedFriend(null)} />
             ) : (
               <PotentialFriends friends={friends} onSelectFriend={handleFriendSelect} />
             )}
           </Col>
         )}
       </Container>
     </Row>
   </Container>
 );
}

export default Window;