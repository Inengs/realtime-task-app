package models

import "time"

type Notifications struct {
	ID        int       `json:"id"`
	UserID    int       `json:"userID"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"isRead"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type NotificationInput struct {
	NotificationIDs []int `json:"notificationIDs" binding:"dive,gt=0" validate:"dive,gt=0"`
}
