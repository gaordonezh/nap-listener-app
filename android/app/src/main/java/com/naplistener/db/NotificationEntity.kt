package com.naplistener.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "notifications")
data class NotificationEntity(
        @PrimaryKey(autoGenerate = true) val id: Long = 0,
        val packageName: String,
        val title: String?,
        val text: String?,
        val timestamp: Long,
        val eventType: String,
        val sent: Boolean = false
)
