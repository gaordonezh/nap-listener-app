package com.naplistener.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.naplistener.db.AppDatabase
import com.naplistener.notification.ApiClient
import com.naplistener.notification.toDto
import java.util.concurrent.TimeUnit

class NotificationSyncWorker(context: Context, params: WorkerParameters) :
        CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val dao = AppDatabase.get(applicationContext).notificationDao()

        val pending = dao.getUnsent(limit = 50)

        if (pending.isEmpty()) {
            return Result.success()
        }

        return try {
            ApiClient.service.sendNotifications(pending.map { it.toDto() })

            dao.markAsSent(pending.map { it.id })
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    companion object {

        const val UNIQUE_NAME = "notification_sync"

        fun enqueue(context: Context) {
            val request =
                    PeriodicWorkRequestBuilder<NotificationSyncWorker>(30, TimeUnit.MINUTES).build()

            WorkManager.getInstance(context)
                    .enqueueUniquePeriodicWork(
                            UNIQUE_NAME,
                            ExistingPeriodicWorkPolicy.UPDATE,
                            request
                    )
        }
    }
}
