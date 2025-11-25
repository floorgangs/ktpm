import React, { useCallback, useEffect, useRef, useState } from 'react';
import ChatWindow from './ChatWindow';
import MessageDisscution from './MessageDisscution';
import './MessagePage.scss';
import { createNewRoom, listRoomOfUser } from '../../services/userService';
import socketIOClient from "socket.io-client";

function MessagePage(props) {
  const [dataRoom, setdataRoom] = useState([]);
  const [selectedRoom, setselectedRoom] = useState('');
  const [dataUser, setdataUser] = useState({});
  const host = process.env.REACT_APP_BACKEND_URL;
  const socketRef = useRef();
  const fetchListRoom = useCallback(async (userId) => {
    const res = await listRoomOfUser(userId);
    if (res && res.errCode === 0) {
      setdataRoom(res.data);
    }
  }, []);

  useEffect(() => {
    const socket = socketIOClient.connect(host);
    socketRef.current = socket;
    const userData = JSON.parse(localStorage.getItem('userData'));
    setdataUser(userData);

    const createRoom = async () => {
      const res = await createNewRoom({
        userId1: userData.id
      });
      if (res && res.errCode) {
        fetchListRoom(userData.id);
      }
    };

    if (userData) {
      socketRef.current.on('getId', data => {
        socketRef.current.id = data;
      }); // phần này đơn giản để gán id cho mỗi phiên kết nối vào page. Mục đích chính là để phân biệt đoạn nào là của mình đang chat.
      createRoom();
  
  
      
      fetchListRoom(userData.id);
  
      socketRef.current.on('sendDataServer', () => {
        fetchListRoom(userData.id);
      });
      socketRef.current.on('loadRoomServer', () => {
        fetchListRoom(userData.id);
      });
      return () => {
        socket.disconnect();
      };
    }
   

  }, [fetchListRoom, host]);

  const handleClickRoom = (roomId) => {
    socketRef.current.emit('loadRoomClient');
    setselectedRoom(roomId);
  };
    return (

        <div className="container">
        <div className="ks-page-content">
          <div className="ks-page-content-body">
            <div className="ks-messenger">
            <MessageDisscution userId={dataUser.id} isAdmin={false} handleClickRoom={handleClickRoom} data={dataRoom}/>
            {selectedRoom ? <ChatWindow userId={dataUser.id} roomId={selectedRoom}  />
            :<div className="ks-messages" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
              <div style={{textAlign: 'center', padding: '40px'}}>
                <div style={{fontSize: '64px', marginBottom: '20px', opacity: 0.3}}>💬</div>
                <span className='title' style={{display: 'block', fontSize: '20px', fontWeight: '600', color: '#5f6368', marginBottom: '8px'}}>
                  Chưa chọn phòng chat
                </span>
                <p style={{fontSize: '14px', color: '#80868b', margin: 0}}>
                  Chọn một cuộc hội thoại bên trái để bắt đầu nhắn tin
                </p>
              </div>
            </div> 
           }
                
             
            </div>
          </div>
        </div>
      </div>

    );
}

export default MessagePage;