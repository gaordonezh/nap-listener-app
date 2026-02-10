package com.netappperu.naplistener.worker

import android.content.Context
import androidx.work.WorkInfo
import androidx.work.WorkManager

object WorkStatusUtils {

    fun isSyncScheduled(context: Context): Boolean {
        val workInfos =
                WorkManager.getInstance(context)
                        .getWorkInfosForUniqueWork(NotificationSyncWorker.UNIQUE_NAME)
                        .get()

        return workInfos.any {
            it.state == WorkInfo.State.ENQUEUED || it.state == WorkInfo.State.RUNNING
        }
    }
}
