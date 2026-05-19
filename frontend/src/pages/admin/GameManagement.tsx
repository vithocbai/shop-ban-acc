import React from "react";
import GameList from "../../features/game/components/GameList";

const GameManagementPage: React.FC = () => {
    return (
        <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Quản lý Danh mục Game</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Quản lý các loại game đang kinh doanh trên hệ thống
                    </p>
                </div>
            </div>

            <GameList />
        </div>
    );
};

export default GameManagementPage;
