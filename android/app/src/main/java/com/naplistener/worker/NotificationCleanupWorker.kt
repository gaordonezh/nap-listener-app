package com.netappperu.naplistener.worker

import android.content.Context
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.netappperu.naplistener.db.AppDatabase

class NotificationCleanupWorker(context: Context, params: WorkerParameters) :
        Worker(context, params) {

    override fun doWork(): Result {
        return try {
            val db = AppDatabase.get(applicationContext)
            val dao = db.notificationDao()

            val now = System.currentTimeMillis()
            val limit = now - TTL_MS

            val deleted = dao.deleteOlderThan(limit)

            Log.d("NapCleanup", "Deleted $deleted old notifications")

            Result.success()
        } catch (e: Exception) {
            Log.e("NapCleanup", "Cleanup failed", e)
            Result.retry()
        }
    }

    companion object {
        private const val TTL_MS = 24 * 60 * 60 * 1000L
    }
}
