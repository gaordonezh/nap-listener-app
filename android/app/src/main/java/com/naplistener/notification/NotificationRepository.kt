package com.netappperu.naplistener.notification

import android.content.Context
import com.netappperu.naplistener.db.AppDatabase
import com.netappperu.naplistener.db.NotificationEntity

object NotificationRepository {

    suspend fun saveAndSend(context: Context, entity: NotificationEntity) {
        val dao = AppDatabase.get(context).notificationDao()

        dao.insert(entity)

        val pending = dao.getUnsent(limit = 50)
        if (pending.isEmpty()) return

        ApiClient.service.sendNotifications(pending.map { it.toDto() })

        dao.markAsSent(pending.map { it.id })
    }
}
