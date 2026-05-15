import React from "react";
import GameList from "../../features/game/components/GameList";

const GameManagementPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Danh mục Game</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý các loại game đang kinh doanh trên hệ thống</p>
                </div>
            </div>

            <GameList />
        </div>
    );
};

export default GameManagementPage;
