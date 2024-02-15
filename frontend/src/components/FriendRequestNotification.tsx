// import React, { useContext } from 'react';
// import { Badge } from 'react-bootstrap';
// import { WebSocketContext } from '../components/WebSocketHandler';

// const FriendRequestNotification: React.FC = () => {
//   const webSocketContext = useContext(WebSocketContext);

//   if (!webSocketContext || !webSocketContext.newFriendRequests) {
//     return null;
//   }

//   return (
//     <Badge pill bg="danger">
//       {webSocketContext.newFriendRequests ? '!' : ''}
//     </Badge>
//   );
// };

// export default FriendRequestNotification;



import React, { useContext, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { WebSocketContext } from '../components/WebSocketHandler';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FriendRequestNotification: React.FC = () => {
  const webSocketContext = useContext(WebSocketContext);

  useEffect(() => {
    if (webSocketContext?.friendRequestReceived) {
      toast(`${webSocketContext.friendRequestReceived.senderName} sent you a friend request.`);
    }
  }, [webSocketContext]);

  const handleAcceptRequest = () => {
    if (webSocketContext?.friendRequestReceived) {
      webSocketContext.acceptFriendRequest(webSocketContext.friendRequestReceived.requestId).then(() => {
        webSocketContext.setNewFriendRequests(false);
      });
    }
  };

  if (!webSocketContext || !webSocketContext.newFriendRequests) {
    return null;
  }

  return (
    <>
      <Badge pill bg="danger" onClick={handleAcceptRequest}>
        {webSocketContext.newFriendRequests ? '!' : ''}
      </Badge>
      <ToastContainer />
    </>
  );
};

export default FriendRequestNotification;