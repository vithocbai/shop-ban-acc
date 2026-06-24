import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { notificationService, type Notification } from "@/services/notification.service";

/**
 * Component hiển thị Chuông thông báo và danh sách thông báo.
 * Sử dụng chiến lược tải dữ liệu khi tương tác (Fetching on Open) để luôn hiển thị dữ liệu mới nhất.
 */
const NotificationDropdown: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Tải thông báo lần đầu khi mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await notificationService.getNotifications();
                if (data && Array.isArray(data)) {
                    setNotifications(data);
                } else if (data && data.items) {
                    setNotifications(data.items);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
        fetchNotifications();
    }, []);

    // Kết nối WebSocket để nhận thông báo real-time
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsBase = import.meta.env.VITE_API_URL 
            ? import.meta.env.VITE_API_URL.replace('http', 'ws').replace('/api', '') 
            : `${protocol}//localhost:8000`;
            
        const wsUrl = `${wsBase}/ws/notifications/?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('Connected to WebSocket for notifications');
        };

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.type === 'new_notification') {
                    const newNotif = payload.data as Notification;
                    setNotifications(prev => [newNotif, ...prev]);
                }
            } catch (err) {
                console.error("Error parsing WS message", err);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    // Đánh dấu 1 thông báo là đã đọc
    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    // Đánh dấu tất cả là đã đọc
    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        }
    };

    return (
        <DropdownMenu onOpenChange={(open) => {
            if (open) {
                // Tự động làm mới thông báo mỗi khi mở chuông
                notificationService.getNotifications().then(data => {
                    if (data && Array.isArray(data)) setNotifications(data);
                    else if (data && data.items) setNotifications(data.items);
                }).catch(err => console.error(err));
            }
        }}>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-1 sm:gap-2 mr-2">
                    <button className="relative p-2 rounded-full hover:bg-gray-100 text-text-secondary transition-colors outline-none cursor-pointer">
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white p-0 border border-border-color shadow-lg rounded-xl overflow-hidden">
                <div className="p-3 border-b border-border-color flex justify-between items-center bg-gray-50/80">
                    <h3 className="font-semibold text-text-main text-sm">Thông báo</h3>
                    {unreadCount > 0 && (
                        <button 
                            onClick={handleMarkAllAsRead}
                            className="text-[12px] text-primary hover:underline font-medium cursor-pointer"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-text-secondary text-sm">
                            Không có thông báo nào.
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={`p-3 border-b border-border-color hover:bg-gray-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                                onClick={() => {
                                    if (!notif.is_read) handleMarkAsRead(notif.id);
                                }}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${!notif.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                                    <div className="flex-1">
                                        <p className={`text-sm ${!notif.is_read ? 'font-semibold text-text-main' : 'text-text-secondary'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-[12px] text-text-secondary mt-0.5 line-clamp-2">
                                            {notif.content}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: vi })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-2 border-t border-border-color text-center bg-gray-50/80 hover:bg-gray-100 cursor-pointer transition-colors">
                    <span className="text-[12px] font-medium text-primary">Xem tất cả</span>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;
