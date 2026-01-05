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
}
