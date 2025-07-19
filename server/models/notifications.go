package models

import "time"

type Notifications struct {
	ID        int       `json:"id"`
	UserID    int       `json:"userID"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"isRead"`
	CreatedAt time.Time `json:"createdAt"`
}

type NotificationInput struct {
	NotificationIDs []int `json:"notificationID"`
}
