package com.naplistener.notification

import android.content.Context
import android.util.Log
import com.naplistener.db.AppDatabase
import com.naplistener.db.NotificationEntity
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.ThreadPoolExecutor
import java.util.concurrent.TimeUnit

object NotificationRepository {

    private val executor =
            ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS, LinkedBlockingQueue(1000))

    fun save(context: Context, entity: NotificationEntity) {
        if (executor.queue.remainingCapacity() == 0) {
            Log.e("NapRepo", "Queue FULL, dropping notification")
            return
        }

        executor.execute {
            try {
                AppDatabase.get(context).notificationDao().insert(entity)
            } catch (e: Exception) {
                Log.e("NapRepo", "DB insert failed", e)
            }
        }
    }

    suspend fun sendImmediately(context: Context): Result<Unit> {
        val dao = AppDatabase.get(context).notificationDao()

        val pending = dao.getUnsent(limit = 50)

        if (pending.isEmpty()) {
            return Result.success(Unit)
        }

        return try {
            ApiClient.service.sendNotifications(pending.map { it.toDto() })

            dao.markAsSent(pending.map { it.id })

            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("NapRepo", "API send failed", e)
            // Si falla, el worker de 30 min lo reintentará
            Result.failure(e)
        }
    }
}
