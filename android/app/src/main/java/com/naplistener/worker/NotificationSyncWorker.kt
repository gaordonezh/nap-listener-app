package com.naplistener.worker

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.naplistener.db.AppDatabase
import com.naplistener.notification.ApiClient
import com.naplistener.notification.toDto

class NotificationSyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {

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

        fun enqueue(context: Context) {
            val request = OneTimeWorkRequestBuilder<NotificationSyncWorker>().build()

            WorkManager.getInstance(context).enqueue(request)
        }
    }
}
