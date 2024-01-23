import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { GameHistory } from '../types';
import styles from '../styles/GameHistoryList.module.css'

const GameHistoryList: React.FC = () => {
    const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
    const [page, setPage] = useState(0);

    useEffect(() => {
        apiService.getGameHistory().then(setGameHistory);
    }, []);

    const loadNextPage = () => {
        setPage(page + 1);
    };

    const loadPreviousPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize:'0.9em' }}>
            <ul>
                {gameHistory.slice(page * 10, (page + 1) * 10).map((game) => (
                    <li style={{marginTop:'0.4em'}} key={game.id}>
                        {game.players[0].username} {game.player1_score} - {game.player2_score} {game.players[1].username}
                    </li>
                ))}
            </ul>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                {gameHistory.length > 10 && (
                    <>
                        <button className={styles.load} onClick={loadPreviousPage} disabled={page === 0}>
                            Previous
                        </button>
                        <button className={styles.load} onClick={loadNextPage} disabled={(page + 1) * 10 >= gameHistory.length}>
                            Next
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default GameHistoryList;