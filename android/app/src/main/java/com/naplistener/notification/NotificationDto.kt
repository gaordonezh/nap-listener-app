package com.naplistener.notification

import com.naplistener.db.NotificationEntity

data class NotificationDto(
        val packageName: String,
        val title: String?,
        val text: String?,
        val timestamp: Long
)

fun NotificationEntity.toDto() =
        NotificationDto(
                packageName = packageName,
                title = title,
                text = text,
                timestamp = timestamp
        )
