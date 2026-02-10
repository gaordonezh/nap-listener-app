package com.netappperu.naplistener.notification

import com.netappperu.naplistener.db.NotificationEntity

data class NotificationDto(
        val packageName: String,
        val title: String?,
        val text: String?,
        val timestamp: Long,
        val phone: String?
)

fun NotificationEntity.toDto() =
        NotificationDto(
                packageName = packageName,
                title = title,
                text = text,
                timestamp = timestamp,
                phone = userName
        )
