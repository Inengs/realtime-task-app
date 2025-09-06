package db

import (
	"database/sql"
	"log"
)

// InitDB initializes the database schema
func InitDB(db *sql.DB) error {
	// Create users table
	_, err := db.Exec(`
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(20) UNIQUE NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		verified BOOLEAN DEFAULT FALSE,
		verification_token TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)
	`)
	if err != nil {
		log.Printf("Error creating users table: %v", err)
		return err
	}

	// Create tasks table (example)
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS tasks (
		id SERIAL PRIMARY KEY,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		description TEXT,
		status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'done')),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)
	`)
	if err != nil {
		log.Printf("Error creating tasks table: %v", err)
		return err
	}

	// Create notifications table
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS notifications (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		message TEXT NOT NULL,
		is_read BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)
	`)

	if err != nil {
		log.Printf("Error creating notifications table: %v", err)
		return err
	}

	// Create Projects table
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS projects (
		id SERIAL PRIMARY KEY,
		userid INTEGER REFERENCES users(id),
		name VARCHAR(255) NOT NULL,
		description TEXT, 
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)
	`)
	if err != nil {
		log.Printf("Error creating notifications table: %v", err)
		return err
	}

	log.Println("Database tables initialized successfully")
	return nil
}
